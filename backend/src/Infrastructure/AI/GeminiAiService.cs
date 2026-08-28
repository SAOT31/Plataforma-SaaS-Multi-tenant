using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Options;
using PlataformaSaaS.Application.Common.Interfaces;
using PlataformaSaaS.Application.Common.Models;
using PlataformaSaaS.Domain.Enums;
using PlataformaSaaS.Infrastructure.AI.Options;

namespace PlataformaSaaS.Infrastructure.AI;

public class GeminiAiService(
    HttpClient httpClient,
    IOptions<GeminiOptions> options) : IAiService
{
    private readonly GeminiOptions _options = options.Value;

    public async Task<string> SynthesizeRagResponseAsync(string query, IReadOnlyList<MatchedArticle> relevantArticles, CancellationToken cancellationToken = default)
    {
        var cleanQuery = query.Trim().ToLowerInvariant();
        if (cleanQuery is "hola" or "hello" or "hi" or "buenos dias" or "buenas tardes" or "buenas noches" or "saludos" or "hey")
        {
            return cleanQuery.Contains("hello") || cleanQuery.Contains("hi") || cleanQuery.Contains("hey")
                ? "Hello! I am your AI support assistant. How can I help you today?"
                : "¡Hola! Soy tu asistente de soporte con IA. ¿En qué puedo ayudarte hoy?";
        }

        if (relevantArticles.Count == 0)
        {
            return "No encontré una respuesta directa en la base de conocimientos. ¿Deseas enviar una solicitud formal de soporte?";
        }

        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            return relevantArticles[0].Content;
        }

        try
        {
            var modelName = string.IsNullOrWhiteSpace(_options.ChatModel) ? "gemini-flash-lite-latest" : _options.ChatModel;
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{modelName}:generateContent";

            var contextText = string.Join("\n\n---\n\n", relevantArticles.Select(a => $"[ARTICLE: {a.Title}]\nCategory: {a.Category}\nContent: {a.Content}"));

            var prompt = $"""
You are a highly precise customer support AI assistant.
Answer the user's inquiry accurately and concisely based strictly on the Knowledge Base Articles below.

CRITICAL RULES:
1. Match the user's question to the specific article that directly addresses it.
2. Formulate your answer using ONLY the matching article.
3. NEVER mix topics from different articles (e.g., NEVER mention invoices if asked about refunds or passwords).
4. If the user asks in Spanish, reply in concise Spanish. If they ask in English, reply in concise English.
5. If the articles do not answer the question, say: 'No encontré una respuesta directa en la base de conocimientos. ¿Deseas enviar una solicitud formal de soporte?'

Knowledge Base Articles:
{contextText}

User Query:
{query}
""";

            var requestMessage = new HttpRequestMessage(HttpMethod.Post, url);
            requestMessage.Headers.Add("x-goog-api-key", _options.ApiKey);

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.1
                }
            };
            requestMessage.Content = JsonContent.Create(requestBody);

            var response = await httpClient.SendAsync(requestMessage, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return relevantArticles[0].Content;
            }

            var json = await response.Content.ReadFromJsonAsync<JsonObject>(cancellationToken: cancellationToken);
            var text = json?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.GetValue<string>();

            return string.IsNullOrWhiteSpace(text) ? relevantArticles[0].Content : text.Trim();
        }
        catch
        {
            return relevantArticles[0].Content;
        }
    }

    public async Task<TriageResult> TriageTicketAsync(string subject, string description, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            return FallbackTriage(subject, description);
        }

        try
        {
            var modelName = string.IsNullOrWhiteSpace(_options.ChatModel) ? "gemini-flash-lite-latest" : _options.ChatModel;
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{modelName}:generateContent";

            var prompt = $"""
Analyze the following customer support ticket (Subject and Description).
Perform classification and extraction, and return ONLY a valid JSON object with the following fields:
- "type": must be one of ["Petition", "Complaint", "Claim", "Suggestion"]
- "priority": must be one of ["Low", "Medium", "High"]
- "sentiment": must be one of ["Positive", "Neutral", "Negative"]
- "executiveSummary": a concise 1-2 sentence executive summary for customer service agents.

Definitions:
- Petition: Standard requests for services, information, or access.
- Complaint: Dissatisfaction with service, delays, or agent behavior.
- Claim: Formal demand regarding billing, defective products, financial loss, or contractual non-compliance.
- Suggestion: Constructive ideas, feature requests, or improvement recommendations.
- Priority High: Urgent issues, severe outage, severe financial/legal claims, or angry complaints.
- Priority Medium: Standard petitions, minor complaints, regular inquiries.
- Priority Low: General suggestions, feedback, simple positive comments.

Ticket Subject: {subject}
Ticket Description: {description}
""";

            var requestMessage = new HttpRequestMessage(HttpMethod.Post, url);
            requestMessage.Headers.Add("x-goog-api-key", _options.ApiKey);

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.1,
                    responseMimeType = "application/json"
                }
            };
            requestMessage.Content = JsonContent.Create(requestBody);

            var response = await httpClient.SendAsync(requestMessage, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return FallbackTriage(subject, description);
            }

            var json = await response.Content.ReadFromJsonAsync<JsonObject>(cancellationToken: cancellationToken);
            var rawText = json?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.GetValue<string>();

            if (string.IsNullOrWhiteSpace(rawText))
            {
                return FallbackTriage(subject, description);
            }

            using var doc = JsonDocument.Parse(rawText);
            var root = doc.RootElement;

            var typeStr = root.TryGetProperty("type", out var pType) ? pType.GetString() : "Petition";
            var priorityStr = root.TryGetProperty("priority", out var pPri) ? pPri.GetString() : "Medium";
            var sentimentStr = root.TryGetProperty("sentiment", out var pSent) ? pSent.GetString() : "Neutral";
            var summary = root.TryGetProperty("executiveSummary", out var pSum) ? pSum.GetString() : $"{subject}: {description}";

            var type = Enum.TryParse<TicketType>(typeStr, true, out var t) ? t : TicketType.Petition;
            var priority = Enum.TryParse<TicketPriority>(priorityStr, true, out var p) ? p : TicketPriority.Medium;
            var sentiment = Enum.TryParse<SentimentType>(sentimentStr, true, out var s) ? s : SentimentType.Neutral;

            return new TriageResult(type, priority, sentiment, summary ?? $"{subject} - {description}");
        }
        catch
        {
            return FallbackTriage(subject, description);
        }
    }

    private static TriageResult FallbackTriage(string subject, string description)
    {
        var combined = $"{subject} {description}".ToLowerInvariant();

        var type = TicketType.Petition;
        if (combined.Contains("claim") || combined.Contains("reclamo") || combined.Contains("refund") || combined.Contains("money") || combined.Contains("charge") || combined.Contains("reembolso") || combined.Contains("cobro"))
        {
            type = TicketType.Claim;
        }
        else if (combined.Contains("complaint") || combined.Contains("queja") || combined.Contains("bad") || combined.Contains("terrible") || combined.Contains("horrible") || combined.Contains("slow") || combined.Contains("malo") || combined.Contains("pésimo"))
        {
            type = TicketType.Complaint;
        }
        else if (combined.Contains("suggest") || combined.Contains("sugerencia") || combined.Contains("idea") || combined.Contains("improve") || combined.Contains("mejorar"))
        {
            type = TicketType.Suggestion;
        }

        var priority = TicketPriority.Medium;
        if (combined.Contains("urgent") || combined.Contains("urgente") || combined.Contains("critical") || combined.Contains("crítico") || combined.Contains("down") || combined.Contains("immediately") || combined.Contains("inmediato") || type == TicketType.Claim)
        {
            priority = TicketPriority.High;
        }
        else if (type == TicketType.Suggestion)
        {
            priority = TicketPriority.Low;
        }

        var sentiment = SentimentType.Neutral;
        if (combined.Contains("terrible") || combined.Contains("angry") || combined.Contains("bad") || combined.Contains("hate") || combined.Contains("broken") || combined.Contains("molesto") || combined.Contains("enojado") || priority == TicketPriority.High)
        {
            sentiment = SentimentType.Negative;
        }
        else if (combined.Contains("thank") || combined.Contains("great") || combined.Contains("good") || combined.Contains("excellent") || combined.Contains("gracias") || combined.Contains("excelente"))
        {
            sentiment = SentimentType.Positive;
        }

        var summary = subject.Length > 80 ? subject[..80] + "..." : subject;

        return new TriageResult(type, priority, sentiment, summary);
    }
}

using Microsoft.EntityFrameworkCore;
using Pgvector.EntityFrameworkCore;
using PlataformaSaaS.Application.Common.Interfaces;
using PlataformaSaaS.Application.Common.Models;
using PlataformaSaaS.Application.DTOs.Widget;
using PlataformaSaaS.Domain.Entities;
using PlataformaSaaS.Domain.Enums;

namespace PlataformaSaaS.Application.Services;

public interface IWidgetService
{
    Task<RagSearchResponseDto> SearchRagAsync(RagSearchRequestDto request, CancellationToken cancellationToken = default);
    Task<bool> RecordDeflectionAsync(RecordDeflectionRequestDto request, CancellationToken cancellationToken = default);
    Task<SubmitTicketWidgetResponseDto> SubmitTicketAsync(SubmitTicketWidgetDto request, CancellationToken cancellationToken = default);
}

public class WidgetService(
    IApplicationDbContext dbContext,
    ICurrentTenantService currentTenantService,
    IEmbeddingService embeddingService,
    IAiService aiService,
    IRealTimeNotifier realTimeNotifier) : IWidgetService
{
    public async Task<RagSearchResponseDto> SearchRagAsync(RagSearchRequestDto request, CancellationToken cancellationToken = default)
    {
        var tenantId = currentTenantService.TenantId ?? throw new InvalidOperationException("Tenant is required.");
        var cleanQuery = request.Query.Trim().ToLowerInvariant();

        if (cleanQuery is "hola" or "hello" or "hi" or "buenos dias" or "buenas tardes" or "buenas noches" or "saludos" or "hey")
        {
            var greetingAnswer = await aiService.SynthesizeRagResponseAsync(request.Query, Array.Empty<MatchedArticle>(), cancellationToken);
            return new RagSearchResponseDto(
                Answer: greetingAnswer,
                FoundAnswer: false,
                ConfidenceScore: 1.0,
                SourceTitles: Array.Empty<string>()
            );
        }

        var queryVector = await embeddingService.GenerateEmbeddingAsync(request.Query, cancellationToken);

        var rawArticles = await dbContext.KnowledgeBaseArticles
            .Where(a => a.TenantId == tenantId && a.IsPublished && a.Embedding != null)
            .OrderBy(a => a.Embedding!.CosineDistance(queryVector))
            .Take(3)
            .Select(a => new
            {
                a.Id,
                a.Title,
                a.Category,
                a.Content,
                Distance = a.Embedding!.CosineDistance(queryVector)
            })
            .ToListAsync(cancellationToken);

        if (rawArticles.Count == 0)
        {
            return new RagSearchResponseDto(
                Answer: "No encontré una respuesta directa en la base de conocimientos. ¿Deseas enviar una solicitud formal de soporte?",
                FoundAnswer: false,
                ConfidenceScore: 0.0,
                SourceTitles: Array.Empty<string>()
            );
        }

        var matchedArticles = rawArticles
            .Select(a => new MatchedArticle(a.Id, a.Title, a.Category, a.Content, Math.Max(0.1, 1.0 - a.Distance)))
            .ToList();

        var synthesizedAnswer = await aiService.SynthesizeRagResponseAsync(request.Query, matchedArticles, cancellationToken);
        var highestScore = matchedArticles.Max(a => a.Similarity);

        var isNegativeAnswer = synthesizedAnswer.Contains("No encontré una respuesta directa", StringComparison.OrdinalIgnoreCase) ||
                               synthesizedAnswer.Contains("I could not find an answer", StringComparison.OrdinalIgnoreCase);

        return new RagSearchResponseDto(
            Answer: synthesizedAnswer,
            FoundAnswer: !isNegativeAnswer,
            ConfidenceScore: Math.Round(highestScore, 2),
            SourceTitles: isNegativeAnswer ? Array.Empty<string>() : matchedArticles.Select(a => a.Title).ToList()
        );
    }

    public async Task<bool> RecordDeflectionAsync(RecordDeflectionRequestDto request, CancellationToken cancellationToken = default)
    {
        var tenantId = currentTenantService.TenantId ?? throw new InvalidOperationException("Tenant is required.");

        var metric = new RagDeflectionMetric
        {
            TenantId = tenantId,
            UserQuery = request.Query,
            AiResponse = request.Answer,
            SimilarityScore = request.ConfidenceScore,
            TimestampUtc = DateTime.UtcNow
        };

        dbContext.RagDeflectionMetrics.Add(metric);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<SubmitTicketWidgetResponseDto> SubmitTicketAsync(SubmitTicketWidgetDto request, CancellationToken cancellationToken = default)
    {
        var tenantId = currentTenantService.TenantId ?? throw new InvalidOperationException("Tenant is required.");

        var triage = await aiService.TriageTicketAsync(request.Subject, request.Description, cancellationToken);

        var count = await dbContext.Tickets.CountAsync(t => t.TenantId == tenantId, cancellationToken);
        var year = DateTime.UtcNow.Year;
        var radicadoNumber = $"RAD-{year}-{(count + 1):D5}";

        var ticket = new Ticket
        {
            TenantId = tenantId,
            RadicadoNumber = radicadoNumber,
            CustomerName = request.CustomerName,
            CustomerEmail = request.CustomerEmail,
            Subject = request.Subject,
            Description = request.Description,
            Type = triage.Type,
            Priority = triage.Priority,
            Sentiment = triage.Sentiment,
            ExecutiveSummary = triage.ExecutiveSummary,
            Status = TicketStatus.Pending,
            IsRagDeflected = false
        };

        dbContext.Tickets.Add(ticket);
        await dbContext.SaveChangesAsync(cancellationToken);

        await realTimeNotifier.NotifyTicketCreatedAsync(ticket, cancellationToken);

        if (ticket.Priority == TicketPriority.High || ticket.Sentiment == SentimentType.Negative)
        {
            await realTimeNotifier.NotifyCriticalAlertAsync(ticket, $"Critical ticket received: {ticket.RadicadoNumber} - {ticket.Subject}", cancellationToken);
        }

        return new SubmitTicketWidgetResponseDto(
            ticket.Id,
            ticket.RadicadoNumber,
            ticket.Type,
            ticket.Priority,
            ticket.Sentiment,
            ticket.ExecutiveSummary,
            ticket.CreatedAtUtc
        );
    }
}

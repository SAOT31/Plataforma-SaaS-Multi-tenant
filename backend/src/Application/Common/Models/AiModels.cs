using PlataformaSaaS.Domain.Enums;

namespace PlataformaSaaS.Application.Common.Models;

public record TriageResult(
    TicketType Type,
    TicketPriority Priority,
    SentimentType Sentiment,
    string ExecutiveSummary
);

public record MatchedArticle(
    Guid Id,
    string Title,
    string Category,
    string Content,
    double Similarity
);

public record RagSynthesisResult(
    string Answer,
    double HighestSimilarity,
    bool MeetsThreshold,
    IReadOnlyList<MatchedArticle> Sources
);

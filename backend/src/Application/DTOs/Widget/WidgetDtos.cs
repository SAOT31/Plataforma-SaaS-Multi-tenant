using PlataformaSaaS.Domain.Enums;

namespace PlataformaSaaS.Application.DTOs.Widget;

public record RagSearchRequestDto(
    string Query
);

public record RagSearchResponseDto(
    string Answer,
    bool FoundAnswer,
    double ConfidenceScore,
    IReadOnlyList<string> SourceTitles
);

public record RecordDeflectionRequestDto(
    string Query,
    string Answer,
    double ConfidenceScore
);

public record SubmitTicketWidgetDto(
    string CustomerName,
    string CustomerEmail,
    string Subject,
    string Description
);

public record SubmitTicketWidgetResponseDto(
    Guid TicketId,
    string RadicadoNumber,
    TicketType Type,
    TicketPriority Priority,
    SentimentType Sentiment,
    string? ExecutiveSummary,
    DateTime CreatedAtUtc
);

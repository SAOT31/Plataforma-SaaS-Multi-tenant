using PlataformaSaaS.Domain.Enums;

namespace PlataformaSaaS.Application.DTOs.Tickets;

public record TicketDto(
    Guid Id,
    Guid TenantId,
    string RadicadoNumber,
    string CustomerName,
    string CustomerEmail,
    string Subject,
    string Description,
    TicketType Type,
    TicketStatus Status,
    TicketPriority Priority,
    SentimentType Sentiment,
    string? ExecutiveSummary,
    bool IsRagDeflected,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc
);

public record TicketFilterDto(
    TicketStatus? Status = null,
    TicketPriority? Priority = null,
    TicketType? Type = null,
    string? SearchQuery = null
);

public record UpdateTicketStatusDto(
    TicketStatus Status,
    TicketPriority? Priority = null
);

public record TicketStatsDto(
    int TotalTickets,
    int PendingTickets,
    int InProgressTickets,
    int ResolvedTickets,
    int CriticalOrHighPriorityTickets,
    int NegativeSentimentTickets,
    int DeflectedTicketsCount,
    double DeflectionRatePercentage
);

using PlataformaSaaS.Domain.Common;
using PlataformaSaaS.Domain.Enums;

namespace PlataformaSaaS.Domain.Entities;

public class Ticket : AuditableEntity
{
    public Guid TenantId { get; set; }
    public required string RadicadoNumber { get; set; }
    public required string CustomerName { get; set; }
    public required string CustomerEmail { get; set; }
    public required string Subject { get; set; }
    public required string Description { get; set; }
    public TicketType Type { get; set; } = TicketType.Petition;
    public TicketStatus Status { get; set; } = TicketStatus.Pending;
    public TicketPriority Priority { get; set; } = TicketPriority.Medium;
    public SentimentType Sentiment { get; set; } = SentimentType.Neutral;
    public string? ExecutiveSummary { get; set; }
    public bool IsRagDeflected { get; set; } = false;

    public Tenant? Tenant { get; set; }
}

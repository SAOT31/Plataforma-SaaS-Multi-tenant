using PlataformaSaaS.Domain.Common;

namespace PlataformaSaaS.Domain.Entities;

public class RagDeflectionMetric : BaseEntity
{
    public Guid TenantId { get; set; }
    public required string UserQuery { get; set; }
    public required string AiResponse { get; set; }
    public double SimilarityScore { get; set; }
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;

    public Tenant? Tenant { get; set; }
}

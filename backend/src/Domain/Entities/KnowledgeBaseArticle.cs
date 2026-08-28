using Pgvector;
using PlataformaSaaS.Domain.Common;

namespace PlataformaSaaS.Domain.Entities;

public class KnowledgeBaseArticle : AuditableEntity
{
    public Guid TenantId { get; set; }
    public required string Title { get; set; }
    public required string Content { get; set; }
    public required string Category { get; set; }
    public Vector? Embedding { get; set; }
    public bool IsPublished { get; set; } = true;

    public Tenant? Tenant { get; set; }
}

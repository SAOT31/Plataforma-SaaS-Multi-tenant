using PlataformaSaaS.Domain.Common;

namespace PlataformaSaaS.Domain.Entities;

public class Tenant : AuditableEntity
{
    public required string Name { get; set; }
    public required string AllowedDomain { get; set; }
    public required string WidgetApiKey { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<KnowledgeBaseArticle> KnowledgeBaseArticles { get; set; } = new List<KnowledgeBaseArticle>();
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}

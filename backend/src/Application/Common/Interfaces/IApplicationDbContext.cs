using Microsoft.EntityFrameworkCore;
using PlataformaSaaS.Domain.Entities;

namespace PlataformaSaaS.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Tenant> Tenants { get; }
    DbSet<User> Users { get; }
    DbSet<KnowledgeBaseArticle> KnowledgeBaseArticles { get; }
    DbSet<Ticket> Tickets { get; }
    DbSet<RagDeflectionMetric> RagDeflectionMetrics { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

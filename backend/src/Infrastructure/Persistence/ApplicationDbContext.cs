using Microsoft.EntityFrameworkCore;
using Pgvector.EntityFrameworkCore;
using PlataformaSaaS.Application.Common.Interfaces;
using PlataformaSaaS.Domain.Entities;

namespace PlataformaSaaS.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options), IApplicationDbContext
{
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<KnowledgeBaseArticle> KnowledgeBaseArticles => Set<KnowledgeBaseArticle>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<RagDeflectionMetric> RagDeflectionMetrics => Set<RagDeflectionMetric>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasPostgresExtension("vector");

        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(150).IsRequired();
            entity.Property(e => e.AllowedDomain).HasMaxLength(255).IsRequired();
            entity.Property(e => e.WidgetApiKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.WidgetApiKey).IsUnique();
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.FullName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.HasIndex(e => new { e.TenantId, e.Email }).IsUnique();
            entity.HasOne(e => e.Tenant)
                  .WithMany(t => t.Users)
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<KnowledgeBaseArticle>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(250).IsRequired();
            entity.Property(e => e.Category).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.Embedding).HasColumnType("vector(768)");
            entity.HasIndex(e => e.Embedding).HasMethod("hnsw").HasOperators("vector_cosine_ops");
            entity.HasIndex(e => new { e.TenantId, e.IsPublished });
            entity.HasOne(e => e.Tenant)
                  .WithMany(t => t.KnowledgeBaseArticles)
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RadicadoNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.CustomerName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.CustomerEmail).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Subject).HasMaxLength(250).IsRequired();
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.ExecutiveSummary).HasMaxLength(1000);

            entity.HasIndex(e => new { e.TenantId, e.Status });
            entity.HasIndex(e => new { e.TenantId, e.Priority });
            entity.HasIndex(e => new { e.TenantId, e.RadicadoNumber }).IsUnique();

            entity.HasOne(e => e.Tenant)
                  .WithMany(t => t.Tickets)
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RagDeflectionMetric>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserQuery).IsRequired();
            entity.Property(e => e.AiResponse).IsRequired();
            entity.HasIndex(e => new { e.TenantId, e.TimestampUtc });
            entity.HasOne(e => e.Tenant)
                  .WithMany()
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

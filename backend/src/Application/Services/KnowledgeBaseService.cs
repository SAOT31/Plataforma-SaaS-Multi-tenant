using Microsoft.EntityFrameworkCore;
using PlataformaSaaS.Application.Common.Interfaces;
using PlataformaSaaS.Application.DTOs.KnowledgeBase;
using PlataformaSaaS.Domain.Entities;

namespace PlataformaSaaS.Application.Services;

public interface IKnowledgeBaseService
{
    Task<IReadOnlyList<ArticleDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ArticleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ArticleDto> CreateAsync(CreateArticleDto request, CancellationToken cancellationToken = default);
    Task<ArticleDto?> UpdateAsync(Guid id, UpdateArticleDto request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public class KnowledgeBaseService(
    IApplicationDbContext dbContext,
    ICurrentTenantService currentTenantService,
    IEmbeddingService embeddingService) : IKnowledgeBaseService
{
    public async Task<IReadOnlyList<ArticleDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var tenantId = currentTenantService.TenantId;
        var articles = await dbContext.KnowledgeBaseArticles
            .Where(a => tenantId == null || a.TenantId == tenantId.Value)
            .OrderByDescending(a => a.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return articles.Select(MapToDto).ToList();
    }

    public async Task<ArticleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var tenantId = currentTenantService.TenantId;
        var article = await dbContext.KnowledgeBaseArticles
            .FirstOrDefaultAsync(a => a.Id == id && (tenantId == null || a.TenantId == tenantId.Value), cancellationToken);

        return article is null ? null : MapToDto(article);
    }

    public async Task<ArticleDto> CreateAsync(CreateArticleDto request, CancellationToken cancellationToken = default)
    {
        var tenantId = currentTenantService.TenantId ?? throw new InvalidOperationException("Tenant is required.");

        var textToEmbed = $"{request.Title}\n{request.Category}\n{request.Content}";
        var embedding = await embeddingService.GenerateEmbeddingAsync(textToEmbed, cancellationToken);

        var article = new KnowledgeBaseArticle
        {
            TenantId = tenantId,
            Title = request.Title,
            Content = request.Content,
            Category = request.Category,
            Embedding = embedding,
            IsPublished = request.IsPublished
        };

        dbContext.KnowledgeBaseArticles.Add(article);
        await dbContext.SaveChangesAsync(cancellationToken);

        return MapToDto(article);
    }

    public async Task<ArticleDto?> UpdateAsync(Guid id, UpdateArticleDto request, CancellationToken cancellationToken = default)
    {
        var tenantId = currentTenantService.TenantId;
        var article = await dbContext.KnowledgeBaseArticles
            .FirstOrDefaultAsync(a => a.Id == id && (tenantId == null || a.TenantId == tenantId.Value), cancellationToken);

        if (article is null)
        {
            return null;
        }

        article.Title = request.Title;
        article.Content = request.Content;
        article.Category = request.Category;
        article.IsPublished = request.IsPublished;
        article.UpdatedAtUtc = DateTime.UtcNow;

        var textToEmbed = $"{request.Title}\n{request.Category}\n{request.Content}";
        article.Embedding = await embeddingService.GenerateEmbeddingAsync(textToEmbed, cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);

        return MapToDto(article);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var tenantId = currentTenantService.TenantId;
        var article = await dbContext.KnowledgeBaseArticles
            .FirstOrDefaultAsync(a => a.Id == id && (tenantId == null || a.TenantId == tenantId.Value), cancellationToken);

        if (article is null)
        {
            return false;
        }

        dbContext.KnowledgeBaseArticles.Remove(article);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static ArticleDto MapToDto(KnowledgeBaseArticle a) =>
        new(
            a.Id,
            a.TenantId,
            a.Title,
            a.Content,
            a.Category,
            a.Embedding is not null,
            a.IsPublished,
            a.CreatedAtUtc,
            a.UpdatedAtUtc
        );
}

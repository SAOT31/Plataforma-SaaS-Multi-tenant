namespace PlataformaSaaS.Application.DTOs.KnowledgeBase;

public record ArticleDto(
    Guid Id,
    Guid TenantId,
    string Title,
    string Content,
    string Category,
    bool HasEmbedding,
    bool IsPublished,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc
);

public record CreateArticleDto(
    string Title,
    string Content,
    string Category,
    bool IsPublished = true
);

public record UpdateArticleDto(
    string Title,
    string Content,
    string Category,
    bool IsPublished
);

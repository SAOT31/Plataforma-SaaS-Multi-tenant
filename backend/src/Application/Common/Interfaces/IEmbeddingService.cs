using Pgvector;

namespace PlataformaSaaS.Application.Common.Interfaces;

public interface IEmbeddingService
{
    Task<Vector> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken = default);
}

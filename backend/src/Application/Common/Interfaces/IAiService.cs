using PlataformaSaaS.Application.Common.Models;

namespace PlataformaSaaS.Application.Common.Interfaces;

public interface IAiService
{
    Task<string> SynthesizeRagResponseAsync(string query, IReadOnlyList<MatchedArticle> relevantArticles, CancellationToken cancellationToken = default);
    Task<TriageResult> TriageTicketAsync(string subject, string description, CancellationToken cancellationToken = default);
}

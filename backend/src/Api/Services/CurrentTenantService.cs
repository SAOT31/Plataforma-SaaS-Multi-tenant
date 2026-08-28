using PlataformaSaaS.Application.Common.Interfaces;

namespace PlataformaSaaS.Api.Services;

public class CurrentTenantService : ICurrentTenantService
{
    public Guid? TenantId { get; set; }
    public string? AllowedDomain { get; set; }
}

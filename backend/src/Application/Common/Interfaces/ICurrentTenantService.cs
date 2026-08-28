namespace PlataformaSaaS.Application.Common.Interfaces;

public interface ICurrentTenantService
{
    Guid? TenantId { get; set; }
    string? AllowedDomain { get; set; }
    bool HasTenant => TenantId.HasValue;
}

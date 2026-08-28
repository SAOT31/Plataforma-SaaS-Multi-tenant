namespace PlataformaSaaS.Application.DTOs.Tenants;

public record TenantDto(
    Guid Id,
    string Name,
    string AllowedDomain,
    string WidgetApiKey
);

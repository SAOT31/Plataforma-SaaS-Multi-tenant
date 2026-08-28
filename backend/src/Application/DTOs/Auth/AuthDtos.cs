using PlataformaSaaS.Domain.Enums;

namespace PlataformaSaaS.Application.DTOs.Auth;

public record LoginRequestDto(
    string Email,
    string Password
);

public record RegisterTenantRequestDto(
    string CompanyName,
    string AllowedDomain,
    string FullName,
    string Email,
    string Password
);

public record AuthResponseDto(
    string Token,
    Guid UserId,
    Guid TenantId,
    string FullName,
    string Email,
    UserRole Role,
    string TenantName,
    string WidgetApiKey
);

using PlataformaSaaS.Domain.Enums;

namespace PlataformaSaaS.Application.DTOs.Users;

public record UserDto(
    Guid Id,
    string FullName,
    string Email,
    UserRole Role,
    bool IsActive,
    DateTime CreatedAtUtc
);

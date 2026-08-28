using Microsoft.EntityFrameworkCore;
using PlataformaSaaS.Application.Common.Interfaces;
using PlataformaSaaS.Application.DTOs.Auth;
using PlataformaSaaS.Domain.Entities;
using PlataformaSaaS.Domain.Enums;

namespace PlataformaSaaS.Application.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> RegisterTenantAsync(RegisterTenantRequestDto request, CancellationToken cancellationToken = default);
}

public class AuthService(
    IApplicationDbContext dbContext,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator jwtTokenGenerator) : IAuthService
{
    public async Task<AuthResponseDto?> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower() && u.IsActive, cancellationToken);

        if (user is null || user.Tenant is null || !user.Tenant.IsActive)
        {
            return null;
        }

        if (!passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return null;
        }

        var token = jwtTokenGenerator.GenerateToken(user, user.Tenant);

        return new AuthResponseDto(
            token,
            user.Id,
            user.TenantId,
            user.FullName,
            user.Email,
            user.Role,
            user.Tenant.Name,
            user.Tenant.WidgetApiKey
        );
    }

    public async Task<AuthResponseDto> RegisterTenantAsync(RegisterTenantRequestDto request, CancellationToken cancellationToken = default)
    {
        var existingUser = await dbContext.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

        if (existingUser != null)
        {
            throw new InvalidOperationException("An account with this email address already exists.");
        }

        var apiKey = $"key_{Guid.NewGuid():N}";

        var tenant = new Tenant
        {
            Name = request.CompanyName,
            AllowedDomain = string.IsNullOrWhiteSpace(request.AllowedDomain) ? "*" : request.AllowedDomain,
            WidgetApiKey = apiKey,
            IsActive = true
        };

        dbContext.Tenants.Add(tenant);

        var user = new User
        {
            TenantId = tenant.Id,
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = passwordHasher.HashPassword(request.Password),
            Role = UserRole.Admin,
            IsActive = true,
            Tenant = tenant
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        var token = jwtTokenGenerator.GenerateToken(user, tenant);

        return new AuthResponseDto(
            token,
            user.Id,
            tenant.Id,
            user.FullName,
            user.Email,
            user.Role,
            tenant.Name,
            tenant.WidgetApiKey
        );
    }
}

using Microsoft.EntityFrameworkCore;
using PlataformaSaaS.Application.Common.Interfaces;
using PlataformaSaaS.Application.DTOs.Users;
using PlataformaSaaS.Domain.Entities;
using PlataformaSaaS.Domain.Enums;

namespace PlataformaSaaS.Application.Services;

public class UserService(
    IApplicationDbContext dbContext,
    ICurrentTenantService currentTenantService,
    IPasswordHasher passwordHasher) : IUserService
{
    public async Task<List<UserDto>> GetAgentsAsync(CancellationToken cancellationToken = default)
    {
        var tenantId = currentTenantService.TenantId;
        if (tenantId == null)
        {
            throw new UnauthorizedAccessException("Tenant ID is missing.");
        }

        var users = await dbContext.Users
            .Where(u => u.TenantId == tenantId.Value && u.Role == UserRole.Agent)
            .OrderByDescending(u => u.CreatedAtUtc)
            .Select(u => new UserDto(
                u.Id,
                u.FullName,
                u.Email,
                u.Role,
                u.IsActive,
                u.CreatedAtUtc
            ))
            .ToListAsync(cancellationToken);

        return users;
    }

    public async Task<UserDto> CreateAgentAsync(CreateAgentDto request, CancellationToken cancellationToken = default)
    {
        var tenantId = currentTenantService.TenantId;
        if (tenantId == null)
        {
            throw new UnauthorizedAccessException("Tenant ID is missing.");
        }

        var existingUser = await dbContext.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

        if (existingUser != null)
        {
            throw new InvalidOperationException("An account with this email address already exists.");
        }

        var user = new User
        {
            TenantId = tenantId.Value,
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = passwordHasher.HashPassword(request.Password),
            Role = UserRole.Agent,
            IsActive = true
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new UserDto(
            user.Id,
            user.FullName,
            user.Email,
            user.Role,
            user.IsActive,
            user.CreatedAtUtc
        );
    }
}

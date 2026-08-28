using PlataformaSaaS.Domain.Entities;

namespace PlataformaSaaS.Application.Common.Interfaces;

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}

public interface IJwtTokenGenerator
{
    string GenerateToken(User user, Tenant tenant);
}

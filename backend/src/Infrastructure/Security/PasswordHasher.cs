using PlataformaSaaS.Application.Common.Interfaces;

namespace PlataformaSaaS.Infrastructure.Security;

public class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password) => BCrypt.Net.BCrypt.HashPassword(password);

    public bool VerifyPassword(string password, string passwordHash) => BCrypt.Net.BCrypt.Verify(password, passwordHash);
}

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PlataformaSaaS.Application.Common.Interfaces;
using PlataformaSaaS.Domain.Entities;

namespace PlataformaSaaS.Infrastructure.Security;

public class JwtTokenGenerator(IConfiguration configuration) : IJwtTokenGenerator
{
    public string GenerateToken(User user, Tenant tenant)
    {
        var secretKey = configuration["Jwt:SecretKey"] ?? "super_secret_pqrs_saas_jwt_key_2026_modern_production_default!";
        var issuer = configuration["Jwt:Issuer"] ?? "PlataformaSaaS.Api";
        var audience = configuration["Jwt:Audience"] ?? "PlataformaSaaS.Clients";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Name, user.FullName),
            new Claim("TenantId", user.TenantId.ToString()),
            new Claim("TenantName", tenant.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using PlataformaSaaS.Application.Common.Interfaces;
using PlataformaSaaS.Application.Services;
using PlataformaSaaS.Infrastructure.AI;
using PlataformaSaaS.Infrastructure.AI.Options;
using PlataformaSaaS.Infrastructure.Persistence;
using PlataformaSaaS.Infrastructure.RealTime;
using PlataformaSaaS.Infrastructure.Security;

namespace PlataformaSaaS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=pqrs_saas;Username=postgres;Password=postgres;";

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString, o =>
            {
                o.UseVector();
                o.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
            }));

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

        services.Configure<GeminiOptions>(configuration.GetSection(GeminiOptions.SectionName));
        services.AddHttpClient<IEmbeddingService, GeminiEmbeddingService>();
        services.AddHttpClient<IAiService, GeminiAiService>();

        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IRealTimeNotifier, SignalRNotifier>();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IKnowledgeBaseService, KnowledgeBaseService>();
        services.AddScoped<ITicketService, TicketService>();
        services.AddScoped<IWidgetService, WidgetService>();
        services.AddScoped<IUserService, UserService>();

        var secretKey = configuration["Jwt:SecretKey"] ?? "super_secret_pqrs_saas_jwt_key_2026_modern_production_default!";
        var issuer = configuration["Jwt:Issuer"] ?? "PlataformaSaaS.Api";
        var audience = configuration["Jwt:Audience"] ?? "PlataformaSaaS.Clients";

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = issuer,
                ValidAudience = audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/tickets"))
                    {
                        context.Token = accessToken;
                    }
                    return Task.CompletedTask;
                }
            };
        });

        services.AddAuthorization();
        services.AddSignalR();

        return services;
    }
}

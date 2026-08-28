using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using PlataformaSaaS.Api.Middlewares;
using PlataformaSaaS.Api.Services;
using PlataformaSaaS.Application.Common.Interfaces;
using PlataformaSaaS.Infrastructure;
using PlataformaSaaS.Infrastructure.Persistence;
using PlataformaSaaS.Infrastructure.RealTime;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddScoped<ICurrentTenantService, CurrentTenantService>();
builder.Services.AddInfrastructureServices(builder.Configuration);



builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();
    var passwordHasher = services.GetRequiredService<IPasswordHasher>();
    var embeddingService = services.GetRequiredService<IEmbeddingService>();
    var dbInitLogger = services.GetRequiredService<ILogger<Program>>();

    const int maxRetries = 10;
    for (var i = 1; i <= maxRetries; i++)
    {
        try
        {
            dbInitLogger.LogInformation("Attempting database connection and creation (attempt {Attempt}/{MaxRetries})...", i, maxRetries);
            await context.Database.EnsureCreatedAsync();
            await ApplicationDbContextSeed.SeedInitialDataAsync(context, passwordHasher, embeddingService);
            dbInitLogger.LogInformation("Database successfully initialized and seeded.");
            break;
        }
        catch (Exception ex)
        {
            dbInitLogger.LogWarning("Database initialization attempt {Attempt} failed: {Message}. Retrying in 2 seconds...", i, ex.Message);
            if (i == maxRetries)
            {
                dbInitLogger.LogError(ex, "Max database connection retries reached.");
            }
            else
            {
                await Task.Delay(2000);
            }
        }
    }
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Plataforma SaaS PQRS API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseMiddleware<TenantResolutionMiddleware>();
app.UseMiddleware<DynamicCorsMiddleware>();
app.UseAuthorization();

app.MapControllers();
app.MapHub<TicketHub>("/hubs/tickets");

app.Logger.LogInformation("Frontend Web Portal: http://localhost:3000");
app.Logger.LogInformation("Backend REST API: http://localhost:5050");
app.Logger.LogInformation("Swagger Documentation: http://localhost:5050/swagger");
app.Logger.LogInformation("Database PostgreSQL pgvector: localhost:5432");

app.Run();

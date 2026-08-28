using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using PlataformaSaaS.Application.Common.Interfaces;
using PlataformaSaaS.Infrastructure.Persistence;

namespace PlataformaSaaS.Api.Middlewares;

public class TenantResolutionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, ICurrentTenantService currentTenantService, ApplicationDbContext dbContext)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var tenantClaim = context.User.FindFirst("TenantId")?.Value;
            if (Guid.TryParse(tenantClaim, out var tenantIdFromJwt))
            {
                currentTenantService.TenantId = tenantIdFromJwt;
            }
        }

        if (!currentTenantService.HasTenant)
        {
            if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantHeader) && Guid.TryParse(tenantHeader, out var tenantIdFromHeader))
            {
                currentTenantService.TenantId = tenantIdFromHeader;
            }
            else if (context.Request.Headers.TryGetValue("X-Api-Key", out var apiKeyHeader) && !string.IsNullOrWhiteSpace(apiKeyHeader))
            {
                var tenant = await dbContext.Tenants
                    .AsNoTracking()
                    .FirstOrDefaultAsync(t => t.WidgetApiKey == apiKeyHeader.ToString() && t.IsActive);

                if (tenant != null)
                {
                    currentTenantService.TenantId = tenant.Id;
                    currentTenantService.AllowedDomain = tenant.AllowedDomain;
                }
            }
            else if (context.Request.Query.TryGetValue("tenantId", out var queryTenant) && Guid.TryParse(queryTenant, out var tenantIdFromQuery))
            {
                currentTenantService.TenantId = tenantIdFromQuery;
            }
        }

        if (currentTenantService.HasTenant && string.IsNullOrEmpty(currentTenantService.AllowedDomain))
        {
            var tenant = await dbContext.Tenants
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == currentTenantService.TenantId!.Value);

            if (tenant != null)
            {
                currentTenantService.AllowedDomain = tenant.AllowedDomain;
            }
        }

        await next(context);
    }
}

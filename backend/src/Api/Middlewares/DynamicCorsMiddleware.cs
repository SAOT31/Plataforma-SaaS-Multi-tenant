using PlataformaSaaS.Application.Common.Interfaces;

namespace PlataformaSaaS.Api.Middlewares;

public class DynamicCorsMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, ICurrentTenantService currentTenantService)
    {
        var origin = context.Request.Headers.Origin.ToString();

        if (!string.IsNullOrEmpty(origin))
        {
            var allowedDomain = currentTenantService.AllowedDomain;

            var isAllowed = string.IsNullOrEmpty(allowedDomain)
                || allowedDomain == "*"
                || origin.Equals(allowedDomain, StringComparison.OrdinalIgnoreCase)
                || origin.EndsWith($".{allowedDomain}", StringComparison.OrdinalIgnoreCase);

            if (isAllowed)
            {
                context.Response.Headers.Append("Access-Control-Allow-Origin", origin);
                context.Response.Headers.Append("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Tenant-Id, X-Api-Key");
                context.Response.Headers.Append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                context.Response.Headers.Append("Access-Control-Allow-Credentials", "true");
            }
        }

        if (context.Request.Method == "OPTIONS")
        {
            context.Response.StatusCode = StatusCodes.Status200OK;
            return;
        }

        await next(context);
    }
}

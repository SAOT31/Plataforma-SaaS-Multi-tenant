using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlataformaSaaS.Application.Common.Interfaces;
using PlataformaSaaS.Application.DTOs.Tenants;

namespace PlataformaSaaS.Api.Controllers;

[ApiController]
[Route("api/v1/tenants")]
public class TenantsController(IApplicationDbContext dbContext, ICurrentTenantService currentTenantService) : ControllerBase
{
    [HttpGet("public-list")]
    public async Task<IActionResult> GetPublicList(CancellationToken cancellationToken)
    {
        var tenants = await dbContext.Tenants
            .AsNoTracking()
            .Where(t => t.IsActive)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.AllowedDomain,
                t.WidgetApiKey
            })
            .ToListAsync(cancellationToken);

        return Ok(tenants);
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(TenantDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCurrentTenant(CancellationToken cancellationToken)
    {
        var tenantId = currentTenantService.TenantId;
        if (!tenantId.HasValue) return Unauthorized();

        var tenant = await dbContext.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == tenantId.Value, cancellationToken);

        if (tenant == null) return NotFound(new { message = "Tenant not found." });

        return Ok(new TenantDto(tenant.Id, tenant.Name, tenant.AllowedDomain, tenant.WidgetApiKey));
    }

    [HttpPut("me/domain")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(TenantDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateDomain([FromBody] UpdateTenantDomainDto request, CancellationToken cancellationToken)
    {
        var tenantId = currentTenantService.TenantId;
        if (!tenantId.HasValue) return Unauthorized();

        var tenant = await dbContext.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId.Value, cancellationToken);
        if (tenant == null) return NotFound(new { message = "Tenant not found." });

        tenant.AllowedDomain = request.AllowedDomain;
        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new TenantDto(tenant.Id, tenant.Name, tenant.AllowedDomain, tenant.WidgetApiKey));
    }
}

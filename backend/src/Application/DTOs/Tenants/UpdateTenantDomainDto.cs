using System.ComponentModel.DataAnnotations;

namespace PlataformaSaaS.Application.DTOs.Tenants;

public record UpdateTenantDomainDto(
    [Required]
    [MaxLength(255)]
    string AllowedDomain
);

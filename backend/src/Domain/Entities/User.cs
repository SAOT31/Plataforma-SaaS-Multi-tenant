using PlataformaSaaS.Domain.Common;
using PlataformaSaaS.Domain.Enums;

namespace PlataformaSaaS.Domain.Entities;

public class User : AuditableEntity
{
    public Guid TenantId { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public required string FullName { get; set; }
    public UserRole Role { get; set; } = UserRole.Agent;
    public bool IsActive { get; set; } = true;

    public Tenant? Tenant { get; set; }
}

using PlataformaSaaS.Application.DTOs.Users;

namespace PlataformaSaaS.Application.Services;

public interface IUserService
{
    Task<List<UserDto>> GetAgentsAsync(CancellationToken cancellationToken = default);
    Task<UserDto> CreateAgentAsync(CreateAgentDto request, CancellationToken cancellationToken = default);
}

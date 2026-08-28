using PlataformaSaaS.Domain.Entities;

namespace PlataformaSaaS.Application.Common.Interfaces;

public interface IRealTimeNotifier
{
    Task NotifyTicketCreatedAsync(Ticket ticket, CancellationToken cancellationToken = default);
    Task NotifyTicketUpdatedAsync(Ticket ticket, CancellationToken cancellationToken = default);
    Task NotifyCriticalAlertAsync(Ticket ticket, string message, CancellationToken cancellationToken = default);
}

using Microsoft.AspNetCore.SignalR;
using PlataformaSaaS.Application.Common.Interfaces;
using PlataformaSaaS.Domain.Entities;

namespace PlataformaSaaS.Infrastructure.RealTime;

public class SignalRNotifier(IHubContext<TicketHub> hubContext) : IRealTimeNotifier
{
    public async Task NotifyTicketCreatedAsync(Ticket ticket, CancellationToken cancellationToken = default)
    {
        var group = $"tenant_{ticket.TenantId}";
        await hubContext.Clients.Group(group).SendAsync("OnTicketCreated", new
        {
            ticket.Id,
            ticket.TenantId,
            ticket.RadicadoNumber,
            ticket.CustomerName,
            ticket.CustomerEmail,
            ticket.Subject,
            ticket.Description,
            Type = ticket.Type.ToString(),
            Status = ticket.Status.ToString(),
            Priority = ticket.Priority.ToString(),
            Sentiment = ticket.Sentiment.ToString(),
            ticket.ExecutiveSummary,
            ticket.CreatedAtUtc
        }, cancellationToken);
    }

    public async Task NotifyTicketUpdatedAsync(Ticket ticket, CancellationToken cancellationToken = default)
    {
        var group = $"tenant_{ticket.TenantId}";
        await hubContext.Clients.Group(group).SendAsync("OnTicketUpdated", new
        {
            ticket.Id,
            ticket.TenantId,
            ticket.RadicadoNumber,
            Status = ticket.Status.ToString(),
            Priority = ticket.Priority.ToString(),
            ticket.UpdatedAtUtc
        }, cancellationToken);
    }

    public async Task NotifyCriticalAlertAsync(Ticket ticket, string message, CancellationToken cancellationToken = default)
    {
        var group = $"tenant_{ticket.TenantId}";
        await hubContext.Clients.Group(group).SendAsync("OnCriticalAlert", new
        {
            ticket.Id,
            ticket.TenantId,
            ticket.RadicadoNumber,
            ticket.Subject,
            Priority = ticket.Priority.ToString(),
            Sentiment = ticket.Sentiment.ToString(),
            Message = message,
            TimestampUtc = DateTime.UtcNow
        }, cancellationToken);
    }
}

using Microsoft.EntityFrameworkCore;
using PlataformaSaaS.Application.Common.Interfaces;
using PlataformaSaaS.Application.DTOs.Tickets;
using PlataformaSaaS.Domain.Entities;
using PlataformaSaaS.Domain.Enums;

namespace PlataformaSaaS.Application.Services;

public interface ITicketService
{
    Task<IReadOnlyList<TicketDto>> GetTicketsAsync(TicketFilterDto filter, CancellationToken cancellationToken = default);
    Task<TicketDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TicketDto?> UpdateStatusAsync(Guid id, UpdateTicketStatusDto request, CancellationToken cancellationToken = default);
    Task<TicketStatsDto> GetStatsAsync(CancellationToken cancellationToken = default);
}

public class TicketService(
    IApplicationDbContext dbContext,
    ICurrentTenantService currentTenantService,
    IRealTimeNotifier realTimeNotifier) : ITicketService
{
    public async Task<IReadOnlyList<TicketDto>> GetTicketsAsync(TicketFilterDto filter, CancellationToken cancellationToken = default)
    {
        var tenantId = currentTenantService.TenantId;
        var query = dbContext.Tickets
            .AsNoTracking()
            .Where(t => tenantId == null || t.TenantId == tenantId.Value);

        if (filter.Status.HasValue)
        {
            query = query.Where(t => t.Status == filter.Status.Value);
        }

        if (filter.Priority.HasValue)
        {
            query = query.Where(t => t.Priority == filter.Priority.Value);
        }

        if (filter.Type.HasValue)
        {
            query = query.Where(t => t.Type == filter.Type.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.SearchQuery))
        {
            var search = filter.SearchQuery.Trim().ToLower();
            query = query.Where(t =>
                t.RadicadoNumber.ToLower().Contains(search) ||
                t.CustomerName.ToLower().Contains(search) ||
                t.CustomerEmail.ToLower().Contains(search) ||
                t.Subject.ToLower().Contains(search));
        }

        var tickets = await query
            .OrderByDescending(t => t.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return tickets.Select(MapToDto).ToList();
    }

    public async Task<TicketDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var tenantId = currentTenantService.TenantId;
        var ticket = await dbContext.Tickets
            .FirstOrDefaultAsync(t => t.Id == id && (tenantId == null || t.TenantId == tenantId.Value), cancellationToken);

        return ticket is null ? null : MapToDto(ticket);
    }

    public async Task<TicketDto?> UpdateStatusAsync(Guid id, UpdateTicketStatusDto request, CancellationToken cancellationToken = default)
    {
        var tenantId = currentTenantService.TenantId;
        var ticket = await dbContext.Tickets
            .FirstOrDefaultAsync(t => t.Id == id && (tenantId == null || t.TenantId == tenantId.Value), cancellationToken);

        if (ticket is null)
        {
            return null;
        }

        ticket.Status = request.Status;
        if (request.Priority.HasValue)
        {
            ticket.Priority = request.Priority.Value;
        }
        ticket.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);
        await realTimeNotifier.NotifyTicketUpdatedAsync(ticket, cancellationToken);

        return MapToDto(ticket);
    }

    public async Task<TicketStatsDto> GetStatsAsync(CancellationToken cancellationToken = default)
    {
        var tenantId = currentTenantService.TenantId;

        var total = await dbContext.Tickets.CountAsync(t => tenantId == null || t.TenantId == tenantId.Value, cancellationToken);
        var pending = await dbContext.Tickets.CountAsync(t => (tenantId == null || t.TenantId == tenantId.Value) && t.Status == TicketStatus.Pending, cancellationToken);
        var inProgress = await dbContext.Tickets.CountAsync(t => (tenantId == null || t.TenantId == tenantId.Value) && t.Status == TicketStatus.InProgress, cancellationToken);
        var resolved = await dbContext.Tickets.CountAsync(t => (tenantId == null || t.TenantId == tenantId.Value) && t.Status == TicketStatus.Resolved, cancellationToken);
        var critical = await dbContext.Tickets.CountAsync(t => (tenantId == null || t.TenantId == tenantId.Value) && t.Priority == TicketPriority.High, cancellationToken);
        var negative = await dbContext.Tickets.CountAsync(t => (tenantId == null || t.TenantId == tenantId.Value) && t.Sentiment == SentimentType.Negative, cancellationToken);
        var deflected = await dbContext.RagDeflectionMetrics.CountAsync(m => tenantId == null || m.TenantId == tenantId.Value, cancellationToken);

        var totalAttempts = total + deflected;
        var deflectionRate = totalAttempts > 0 ? Math.Round((double)deflected / totalAttempts * 100, 1) : 0.0;

        return new TicketStatsDto(
            TotalTickets: total,
            PendingTickets: pending,
            InProgressTickets: inProgress,
            ResolvedTickets: resolved,
            CriticalOrHighPriorityTickets: critical,
            NegativeSentimentTickets: negative,
            DeflectedTicketsCount: deflected,
            DeflectionRatePercentage: deflectionRate
        );
    }

    private static TicketDto MapToDto(Ticket t) =>
        new(
            t.Id,
            t.TenantId,
            t.RadicadoNumber,
            t.CustomerName,
            t.CustomerEmail,
            t.Subject,
            t.Description,
            t.Type,
            t.Status,
            t.Priority,
            t.Sentiment,
            t.ExecutiveSummary,
            t.IsRagDeflected,
            t.CreatedAtUtc,
            t.UpdatedAtUtc
        );
}

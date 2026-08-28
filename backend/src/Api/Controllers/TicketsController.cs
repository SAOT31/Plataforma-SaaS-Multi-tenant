using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlataformaSaaS.Application.DTOs.Tickets;
using PlataformaSaaS.Application.Services;

namespace PlataformaSaaS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/tickets")]
public class TicketsController(ITicketService ticketService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<TicketDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTickets([FromQuery] TicketFilterDto filter, CancellationToken cancellationToken)
    {
        var tickets = await ticketService.GetTicketsAsync(filter, cancellationToken);
        return Ok(tickets);
    }

    [HttpGet("stats")]
    [ProducesResponseType(typeof(TicketStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats(CancellationToken cancellationToken)
    {
        var stats = await ticketService.GetStatsAsync(cancellationToken);
        return Ok(stats);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var ticket = await ticketService.GetByIdAsync(id, cancellationToken);
        if (ticket is null)
        {
            return NotFound(new { message = "Ticket not found." });
        }
        return Ok(ticket);
    }

    [HttpPut("{id:guid}/status")]
    [ProducesResponseType(typeof(TicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTicketStatusDto request, CancellationToken cancellationToken)
    {
        var updated = await ticketService.UpdateStatusAsync(id, request, cancellationToken);
        if (updated is null)
        {
            return NotFound(new { message = "Ticket not found." });
        }
        return Ok(updated);
    }
}

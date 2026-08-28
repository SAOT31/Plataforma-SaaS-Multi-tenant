using Microsoft.AspNetCore.Mvc;
using PlataformaSaaS.Application.DTOs.Widget;
using PlataformaSaaS.Application.Services;

namespace PlataformaSaaS.Api.Controllers;

[ApiController]
[Route("api/v1/widget")]
public class WidgetController(IWidgetService widgetService) : ControllerBase
{
    [HttpPost("rag-search")]
    [ProducesResponseType(typeof(RagSearchResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RagSearch([FromBody] RagSearchRequestDto request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Query))
        {
            return BadRequest(new { message = "Query cannot be empty." });
        }

        var response = await widgetService.SearchRagAsync(request, cancellationToken);
        return Ok(response);
    }

    [HttpPost("deflect")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RecordDeflection([FromBody] RecordDeflectionRequestDto request, CancellationToken cancellationToken)
    {
        var result = await widgetService.RecordDeflectionAsync(request, cancellationToken);
        return Ok(new { success = result });
    }

    [HttpPost("tickets")]
    [ProducesResponseType(typeof(SubmitTicketWidgetResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitTicket([FromBody] SubmitTicketWidgetDto request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName) || string.IsNullOrWhiteSpace(request.CustomerEmail) ||
            string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.Description))
        {
            return BadRequest(new { message = "All fields (Name, Email, Subject, Description) are required." });
        }

        var response = await widgetService.SubmitTicketAsync(request, cancellationToken);
        return CreatedAtAction(nameof(SubmitTicket), new { id = response.TicketId }, response);
    }
}

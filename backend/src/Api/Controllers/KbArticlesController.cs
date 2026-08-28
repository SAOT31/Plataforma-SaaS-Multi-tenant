using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlataformaSaaS.Application.DTOs.KnowledgeBase;
using PlataformaSaaS.Application.Services;

namespace PlataformaSaaS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/kb-articles")]
public class KbArticlesController(IKnowledgeBaseService kbService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ArticleDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var articles = await kbService.GetAllAsync(cancellationToken);
        return Ok(articles);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ArticleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var article = await kbService.GetByIdAsync(id, cancellationToken);
        if (article is null)
        {
            return NotFound(new { message = "Knowledge base article not found." });
        }
        return Ok(article);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ArticleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateArticleDto request, CancellationToken cancellationToken)
    {
        var created = await kbService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ArticleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateArticleDto request, CancellationToken cancellationToken)
    {
        var updated = await kbService.UpdateAsync(id, request, cancellationToken);
        if (updated is null)
        {
            return NotFound(new { message = "Knowledge base article not found." });
        }
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var success = await kbService.DeleteAsync(id, cancellationToken);
        if (!success)
        {
            return NotFound(new { message = "Knowledge base article not found." });
        }
        return NoContent();
    }
}

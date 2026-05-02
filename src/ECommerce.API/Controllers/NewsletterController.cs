using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Route("api/[controller]")]
public class NewsletterController : ApiControllerBase
{
    private readonly INewsletterService _newsletter;

    public NewsletterController(INewsletterService newsletter) => _newsletter = newsletter;

    [HttpPost("subscribe")]
    [AllowAnonymous]
    public async Task<IActionResult> Subscribe([FromBody] NewsletterSubscribeRequest request, CancellationToken ct)
    {
        var message = await _newsletter.SubscribeAsync(request.Email, ct);
        return Ok<string>(message, message);
    }
}

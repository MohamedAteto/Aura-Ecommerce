using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Route("api/[controller]")]
public class ProductsController : ApiControllerBase
{
    private readonly IProductService _products;

    public ProductsController(IProductService products) => _products = products;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Get([FromQuery] ProductQuery query, CancellationToken ct) =>
        Ok(await _products.GetProductsAsync(query, ct));

    [HttpGet("categories")]
    [AllowAnonymous]
    public async Task<IActionResult> Categories(CancellationToken ct) =>
        Ok(await _products.GetCategoriesAsync(ct));

    [HttpGet("suggestions")]
    [AllowAnonymous]
    public async Task<IActionResult> Suggestions([FromQuery] string? q, CancellationToken ct) =>
        Ok(await _products.GetSuggestionsAsync(q ?? string.Empty, ct));

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id, CancellationToken ct) =>
        Ok(await _products.GetByIdAsync(id, ct));

    [HttpGet("{id:int}/related")]
    [AllowAnonymous]
    public async Task<IActionResult> Related(int id, [FromQuery] int limit = 4, CancellationToken ct = default) =>
        Ok(await _products.GetRelatedAsync(id, limit, ct));

    [HttpGet("{id:int}/reviews")]
    [AllowAnonymous]
    public async Task<IActionResult> GetReviews(int id, [FromQuery] int limit = 10, CancellationToken ct = default) =>
        Ok(await _products.GetReviewsAsync(id, limit, ct));

    [HttpPost("{id:int}/reviews")]
    [Authorize]
    public async Task<IActionResult> AddReview(int id, [FromBody] AddReviewRequest request, CancellationToken ct)
    {
        var review = await _products.AddReviewAsync(UserId(), id, request, ct);
        return Created($"/api/Products/{id}/reviews/{review.Id}", review);
    }

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Create([FromBody] ProductUpsertRequest request, CancellationToken ct)
    {
        var created = await _products.CreateAsync(request, ct);
        return Created($"/api/Products/{created.Id}", created);
    }

    [HttpPost("bulk")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> CreateBulk([FromBody] BulkProductRequest request, CancellationToken ct) =>
        Ok(await _products.CreateBulkAsync(request, ct));

    [HttpPut("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Update(int id, [FromBody] ProductUpsertRequest request, CancellationToken ct) =>
        Ok(await _products.UpdateAsync(id, request, ct));

    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await _products.DeleteAsync(id, ct);
        return NoContent();
    }

    private int UserId() => int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
}

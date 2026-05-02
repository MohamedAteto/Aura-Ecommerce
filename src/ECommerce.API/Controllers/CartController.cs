using System.Security.Claims;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Route("api/[controller]")]
[Authorize]
public class CartController : ApiControllerBase
{
    private readonly ICartService _cart;

    public CartController(ICartService cart) => _cart = cart;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct) =>
        Ok(await _cart.GetCartResponseAsync(UserId(), ct));

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] AddToCartRequest request, CancellationToken ct)
    {
        await _cart.AddAsync(UserId(), request, ct);
        return Ok(await _cart.GetCartResponseAsync(UserId(), ct));
    }

    [HttpPut("{cartItemId:int}")]
    public async Task<IActionResult> Update(int cartItemId, [FromBody] UpdateCartItemRequest request, CancellationToken ct)
    {
        await _cart.UpdateQuantityAsync(UserId(), cartItemId, request, ct);
        return NoContent();
    }

    [HttpDelete("{cartItemId:int}")]
    public async Task<IActionResult> Remove(int cartItemId, CancellationToken ct)
    {
        await _cart.RemoveAsync(UserId(), cartItemId, ct);
        return NoContent();
    }

    [HttpPost("apply-coupon")]
    public async Task<IActionResult> ApplyCoupon([FromBody] ApplyCouponRequest request, CancellationToken ct) =>
        Ok(await _cart.ApplyCouponAsync(UserId(), request.Code, ct));

    [HttpPost("sync")]
    public async Task<IActionResult> Sync([FromBody] CartSyncRequest request, CancellationToken ct) =>
        Ok(await _cart.SyncGuestCartAsync(UserId(), request.Items, ct));

    private int UserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
}

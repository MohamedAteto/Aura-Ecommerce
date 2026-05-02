using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Route("api/[controller]")]
[Authorize(Roles = Roles.Admin)]
public class AdminController : ApiControllerBase
{
    private readonly IAdminService _admin;
    private readonly IOrderService _orders;
    private readonly IProductService _products;
    private readonly IDiscountService _discounts;
    private readonly IUserRepository _users;

    public AdminController(IAdminService admin, IOrderService orders, IProductService products,
        IDiscountService discounts, IUserRepository users)
    {
        _admin = admin;
        _orders = orders;
        _products = products;
        _discounts = discounts;
        _users = users;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> Stats(CancellationToken ct) =>
        Ok(await _admin.GetStatsAsync(ct));

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard(CancellationToken ct) =>
        Ok(await _admin.GetDashboardAsync(ct));

    [HttpGet("users")]
    public async Task<IActionResult> Users(CancellationToken ct)
    {
        var users = await _users.GetAllAsync(ct);
        var dtos = users.Select(u => new UserDto
        {
            Id = u.Id,
            Email = u.Email,
            FullName = u.FullName,
            Role = u.Role,
            OrderCount = u.Orders?.Count ?? 0
        }).ToList();
        return Ok(dtos);
    }

    [HttpPatch("orders/{id:int}/status")]
    public async Task<IActionResult> AdvanceOrderStatus(int id, [FromBody] AdvanceStatusRequest request, CancellationToken ct) =>
        Ok(await _orders.AdvanceStatusAsync(id, request.Status, ct));

    [HttpPatch("products/{id:int}/stock")]
    public async Task<IActionResult> UpdateStock(int id, [FromBody] UpdateStockRequest request, CancellationToken ct)
    {
        await _products.UpdateStockAsync(id, request.VariationId, request.Quantity, ct);
        return NoContent();
    }

    // Coupon CRUD
    [HttpGet("coupons")]
    public async Task<IActionResult> GetCoupons(CancellationToken ct) =>
        Ok(await _discounts.GetAllCouponsAsync(ct));

    [HttpPost("coupons")]
    public async Task<IActionResult> CreateCoupon([FromBody] UpsertCouponRequest request, CancellationToken ct)
    {
        var coupon = await _discounts.CreateCouponAsync(request, ct);
        return Created($"/api/Admin/coupons/{coupon.Id}", coupon);
    }

    [HttpPut("coupons/{id:int}")]
    public async Task<IActionResult> UpdateCoupon(int id, [FromBody] UpsertCouponRequest request, CancellationToken ct) =>
        Ok(await _discounts.UpdateCouponAsync(id, request, ct));

    [HttpDelete("coupons/{id:int}")]
    public async Task<IActionResult> DeleteCoupon(int id, CancellationToken ct)
    {
        await _discounts.DeleteCouponAsync(id, ct);
        return NoContent();
    }
}

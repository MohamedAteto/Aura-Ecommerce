using System.Security.Claims;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Route("api/[controller]")]
[Authorize]
public class OrdersController : ApiControllerBase
{
    private readonly IOrderService _orders;

    public OrdersController(IOrderService orders) => _orders = orders;

    [HttpGet("my")]
    public async Task<IActionResult> MyOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default) =>
        Ok(await _orders.GetMyOrdersPagedAsync(UserId(), page, pageSize, ct));

    [HttpGet("admin/all")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> All(CancellationToken ct) =>
        Ok(await _orders.GetAllOrdersAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct) =>
        Ok(await _orders.GetOrderAsync(UserId(), id, IsAdmin(), ct));

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest? request, CancellationToken ct) =>
        Ok(await _orders.CheckoutAsync(UserId(), request?.CouponCode, ct));

    [HttpPost("{id:int}/pay")]
    public async Task<IActionResult> Pay(int id, [FromBody] PaymentSimulateRequest request, CancellationToken ct) =>
        Ok(await _orders.SimulatePaymentAsync(UserId(), id, request, IsAdmin(), ct));

    private int UserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
    private bool IsAdmin() => User.IsInRole(Roles.Admin);
}

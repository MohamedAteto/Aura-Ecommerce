using ECommerce.Application.Common;
using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface IOrderService
{
    Task<OrderDto> CheckoutAsync(int userId, string? couponCode, CancellationToken ct = default);
    Task<PagedResult<OrderDto>> GetMyOrdersPagedAsync(int userId, int page, int pageSize, CancellationToken ct = default);
    Task<IReadOnlyList<OrderDto>> GetMyOrdersAsync(int userId, CancellationToken ct = default);
    Task<OrderDto> GetOrderAsync(int userId, int orderId, bool isAdmin, CancellationToken ct = default);
    Task<IReadOnlyList<OrderDto>> GetAllOrdersAsync(CancellationToken ct = default);
    Task<OrderDto> SimulatePaymentAsync(int userId, int orderId, PaymentSimulateRequest request, bool isAdmin, CancellationToken ct = default);
    Task<OrderDto> AdvanceStatusAsync(int orderId, string newStatus, CancellationToken ct = default);
}

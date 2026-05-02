using ECommerce.Application.Common;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<Order>> GetByUserIdAsync(int userId, CancellationToken ct = default);
    Task<PagedResult<Order>> GetByUserIdPagedAsync(int userId, int page, int pageSize, CancellationToken ct = default);
    Task<IReadOnlyList<Order>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(Order order, CancellationToken ct = default);
    Task<int> CountAsync(CancellationToken ct = default);
    Task<decimal> SumRevenueAsync(CancellationToken ct = default);
    Task<List<(DateTime Date, decimal Revenue)>> GetRevenueByDayAsync(int days, CancellationToken ct = default);
    Task<List<(string Status, int Count)>> GetOrdersByStatusAsync(CancellationToken ct = default);
    Task<List<(int ProductId, string Name, decimal Revenue)>> GetTopProductsAsync(int limit, CancellationToken ct = default);
}

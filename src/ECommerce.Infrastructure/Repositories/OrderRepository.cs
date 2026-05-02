using ECommerce.Application.Common;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _db;

    public OrderRepository(AppDbContext db) => _db = db;

    public Task<Order?> GetByIdAsync(int id, CancellationToken ct = default) =>
        _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<IReadOnlyList<Order>> GetByUserIdAsync(int userId, CancellationToken ct = default) =>
        await _db.Orders.AsNoTracking()
            .Where(o => o.UserId == userId)
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAtUtc)
            .ToListAsync(ct);

    public async Task<PagedResult<Order>> GetByUserIdPagedAsync(int userId, int page, int pageSize, CancellationToken ct = default)
    {
        var q = _db.Orders.AsNoTracking()
            .Where(o => o.UserId == userId)
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAtUtc);

        var total = await q.CountAsync(ct);
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return new PagedResult<Order> { Items = items, Page = page, PageSize = pageSize, TotalCount = total };
    }

    public async Task<IReadOnlyList<Order>> GetAllAsync(CancellationToken ct = default) =>
        await _db.Orders.AsNoTracking()
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAtUtc)
            .ToListAsync(ct);

    public async Task AddAsync(Order order, CancellationToken ct = default) =>
        await _db.Orders.AddAsync(order, ct);

    public Task<int> CountAsync(CancellationToken ct = default) => _db.Orders.CountAsync(ct);

    public async Task<decimal> SumRevenueAsync(CancellationToken ct = default) =>
        await _db.Orders.AsNoTracking()
            .Where(o => o.Status != OrderStatuses.Cancelled && o.Status != OrderStatuses.Failed)
            .SumAsync(o => o.TotalAmount - o.DiscountAmount, ct);

    public async Task<List<(DateTime Date, decimal Revenue)>> GetRevenueByDayAsync(int days, CancellationToken ct = default)
    {
        var since = DateTime.UtcNow.Date.AddDays(-days + 1);
        var raw = await _db.Orders.AsNoTracking()
            .Where(o => o.CreatedAtUtc >= since
                && o.Status != OrderStatuses.Cancelled
                && o.Status != OrderStatuses.Failed)
            .GroupBy(o => o.CreatedAtUtc.Date)
            .Select(g => new { Date = g.Key, Revenue = g.Sum(o => o.TotalAmount - o.DiscountAmount) })
            .ToListAsync(ct);
        return raw.Select(x => (x.Date, x.Revenue)).ToList();
    }

    public async Task<List<(string Status, int Count)>> GetOrdersByStatusAsync(CancellationToken ct = default)
    {
        var raw = await _db.Orders.AsNoTracking()
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(ct);
        return raw.Select(x => (x.Status, x.Count)).ToList();
    }

    public async Task<List<(int ProductId, string Name, decimal Revenue)>> GetTopProductsAsync(int limit, CancellationToken ct = default)
    {
        var raw = await _db.OrderItems.AsNoTracking()
            .Include(i => i.Order)
            .Where(i => i.Order.Status != OrderStatuses.Cancelled && i.Order.Status != OrderStatuses.Failed)
            .GroupBy(i => new { i.ProductId, i.ProductName })
            .Select(g => new { g.Key.ProductId, g.Key.ProductName, Revenue = g.Sum(i => i.UnitPrice * i.Quantity) })
            .OrderByDescending(x => x.Revenue)
            .Take(limit)
            .ToListAsync(ct);
        return raw.Select(x => (x.ProductId, x.ProductName, x.Revenue)).ToList();
    }
}

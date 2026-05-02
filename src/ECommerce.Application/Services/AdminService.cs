using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;

namespace ECommerce.Application.Services;

public class AdminService : IAdminService
{
    private readonly IUserRepository _users;
    private readonly IOrderRepository _orders;
    private readonly IProductRepository _products;

    public AdminService(IUserRepository users, IOrderRepository orders, IProductRepository products)
    {
        _users = users;
        _orders = orders;
        _products = products;
    }

    public async Task<AdminStatsDto> GetStatsAsync(CancellationToken ct = default)
    {
        var userCount = await _users.CountAsync(ct);
        var orderCount = await _orders.CountAsync(ct);
        var revenue = await _orders.SumRevenueAsync(ct);
        return new AdminStatsDto
        {
            UserCount = userCount,
            OrderCount = orderCount,
            Revenue = revenue
        };
    }

    public async Task<DashboardDto> GetDashboardAsync(CancellationToken ct = default)
    {
        var userCount = await _users.CountAsync(ct);
        var orderCount = await _orders.CountAsync(ct);
        var revenue = await _orders.SumRevenueAsync(ct);
        var productCount = await _products.CountAsync(ct);
        var revenueByDay = await _orders.GetRevenueByDayAsync(30, ct);
        var ordersByStatus = await _orders.GetOrdersByStatusAsync(ct);
        var topProducts = await _orders.GetTopProductsAsync(5, ct);

        return new DashboardDto
        {
            TotalRevenue = revenue,
            TotalOrders = orderCount,
            TotalUsers = userCount,
            TotalProducts = productCount,
            RevenueByDay = revenueByDay.Select(x => new RevenueByDayDto
            {
                Date = x.Date.ToString("yyyy-MM-dd"),
                Revenue = x.Revenue
            }).ToList(),
            OrdersByStatus = ordersByStatus.Select(x => new OrdersByStatusDto
            {
                Status = x.Status,
                Count = x.Count
            }).ToList(),
            TopProducts = topProducts.Select(x => new TopProductDto
            {
                ProductId = x.ProductId,
                Name = x.Name,
                Revenue = x.Revenue
            }).ToList()
        };
    }
}

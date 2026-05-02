namespace ECommerce.Application.DTOs;

public class AdminStatsDto
{
    public int UserCount { get; set; }
    public int OrderCount { get; set; }
    public decimal Revenue { get; set; }
}

public class DashboardDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public int TotalUsers { get; set; }
    public int TotalProducts { get; set; }
    public List<RevenueByDayDto> RevenueByDay { get; set; } = new();
    public List<OrdersByStatusDto> OrdersByStatus { get; set; } = new();
    public List<TopProductDto> TopProducts { get; set; } = new();
}

public class RevenueByDayDto
{
    public string Date { get; set; } = null!;
    public decimal Revenue { get; set; }
}

public class OrdersByStatusDto
{
    public string Status { get; set; } = null!;
    public int Count { get; set; }
}

public class TopProductDto
{
    public int ProductId { get; set; }
    public string Name { get; set; } = null!;
    public decimal Revenue { get; set; }
}

public class UserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Role { get; set; } = null!;
    public int OrderCount { get; set; }
}

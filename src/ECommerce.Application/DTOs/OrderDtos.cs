namespace ECommerce.Application.DTOs;

public class OrderItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
}

public class OrderDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = null!;
    public string? CouponCode { get; set; }
    public decimal DiscountAmount { get; set; }
    public IReadOnlyList<OrderItemDto> Items { get; set; } = Array.Empty<OrderItemDto>();
}

public class PaymentSimulateRequest
{
    public bool Succeed { get; set; }
}

public class CheckoutRequest
{
    public string? CouponCode { get; set; }
}

public class AdvanceStatusRequest
{
    public string Status { get; set; } = null!;
}

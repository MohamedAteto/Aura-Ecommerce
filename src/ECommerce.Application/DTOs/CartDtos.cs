namespace ECommerce.Application.DTOs;

public class CartItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string ImageUrl { get; set; } = null!;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public int? VariationId { get; set; }
    public string? VariationLabel { get; set; }
    public decimal LineTotal => UnitPrice * Quantity;
}

public class CartResponseDto
{
    public List<CartItemDto> Items { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? CouponCode { get; set; }
    public decimal Total { get; set; }
}

public class AddToCartRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; } = 1;
    public int? VariationId { get; set; }
}

public class UpdateCartItemRequest
{
    public int Quantity { get; set; }
}

public class GuestCartItem
{
    public int ProductId { get; set; }
    public int? VariationId { get; set; }
    public int Quantity { get; set; }
}

public class CartSyncRequest
{
    public List<GuestCartItem> Items { get; set; } = new();
}

namespace ECommerce.Application.DTOs;

public class DiscountDto
{
    public int Id { get; set; }
    public string Code { get; set; } = null!;
    public string Type { get; set; } = null!;
    public decimal Value { get; set; }
    public decimal MinOrderAmount { get; set; }
    public int? MaxUses { get; set; }
    public int UsedCount { get; set; }
    public DateTime? ExpiresAtUtc { get; set; }
    public bool IsActive { get; set; }
}

public class UpsertCouponRequest
{
    public string Code { get; set; } = null!;
    public string Type { get; set; } = null!;
    public decimal Value { get; set; }
    public decimal MinOrderAmount { get; set; }
    public int? MaxUses { get; set; }
    public DateTime? ExpiresAtUtc { get; set; }
    public bool IsActive { get; set; } = true;
}

public class ApplyCouponRequest
{
    public string Code { get; set; } = null!;
}

public class ApplyCouponResult
{
    public string CouponCode { get; set; } = null!;
    public decimal DiscountAmount { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Total { get; set; }
}

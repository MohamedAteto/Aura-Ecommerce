namespace ECommerce.Domain.Entities;

public class Discount
{
    public int Id { get; set; }
    public string Code { get; set; } = null!;   // unique, case-insensitive
    public string Type { get; set; } = null!;   // "Percentage" | "FixedAmount"
    public decimal Value { get; set; }
    public decimal MinOrderAmount { get; set; }
    public int? MaxUses { get; set; }
    public int UsedCount { get; set; }
    public DateTime? ExpiresAtUtc { get; set; }
    public bool IsActive { get; set; }
}

public static class DiscountTypes
{
    public const string Percentage = "Percentage";
    public const string FixedAmount = "FixedAmount";
}

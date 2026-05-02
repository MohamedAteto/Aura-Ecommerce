namespace ECommerce.Domain.Entities;

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime CreatedAtUtc { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = OrderStatuses.Pending;
    public string? CouponCode { get; set; }
    public decimal DiscountAmount { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}

public static class OrderStatuses
{
    public const string Pending = "Pending";
    public const string Processing = "Processing";
    public const string Shipped = "Shipped";
    public const string Delivered = "Delivered";
    public const string Cancelled = "Cancelled";
    public const string Failed = "Failed";

    // Legacy aliases kept for migration compatibility
    public const string PendingPayment = "Pending";
    public const string Paid = "Processing";

    public static readonly IReadOnlyDictionary<string, string[]> ValidTransitions = new Dictionary<string, string[]>
    {
        [Pending] = new[] { Processing, Cancelled },
        [Processing] = new[] { Shipped, Cancelled },
        [Shipped] = new[] { Delivered },
        [Delivered] = Array.Empty<string>(),
        [Cancelled] = Array.Empty<string>(),
        [Failed] = Array.Empty<string>(),
    };

    public static bool IsValidTransition(string current, string next) =>
        ValidTransitions.TryGetValue(current, out var allowed) && allowed.Contains(next);
}

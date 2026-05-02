namespace ECommerce.Domain.Entities;

public class Review
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int Rating { get; set; }          // 1–5
    public string? Comment { get; set; }     // max 1000 chars
    public DateTime CreatedAtUtc { get; set; }
}

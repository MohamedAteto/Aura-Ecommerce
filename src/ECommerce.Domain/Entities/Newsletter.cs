namespace ECommerce.Domain.Entities;

public class Newsletter
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public DateTime SubscribedAtUtc { get; set; }
}

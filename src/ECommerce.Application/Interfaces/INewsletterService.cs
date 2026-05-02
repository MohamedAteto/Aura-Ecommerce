namespace ECommerce.Application.Interfaces;

public interface INewsletterService
{
    Task<string> SubscribeAsync(string email, CancellationToken ct = default);
}

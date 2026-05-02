using ECommerce.Application.Exceptions;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Services;

public class NewsletterService : INewsletterService
{
    private readonly INewsletterRepository _newsletters;
    private readonly IUnitOfWork _unitOfWork;

    public NewsletterService(INewsletterRepository newsletters, IUnitOfWork unitOfWork)
    {
        _newsletters = newsletters;
        _unitOfWork = unitOfWork;
    }

    public async Task<string> SubscribeAsync(string email, CancellationToken ct = default)
    {
        var existing = await _newsletters.GetByEmailAsync(email, ct);
        if (existing is not null)
            return "You are already subscribed.";

        await _newsletters.AddAsync(new Newsletter
        {
            Email = email.Trim().ToLower(),
            SubscribedAtUtc = DateTime.UtcNow
        }, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return "Thank you for subscribing!";
    }
}

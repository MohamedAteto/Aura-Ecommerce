using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces;

public interface INewsletterRepository
{
    Task<Newsletter?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task AddAsync(Newsletter newsletter, CancellationToken ct = default);
}

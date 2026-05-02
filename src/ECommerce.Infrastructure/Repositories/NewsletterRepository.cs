using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class NewsletterRepository : INewsletterRepository
{
    private readonly AppDbContext _db;

    public NewsletterRepository(AppDbContext db) => _db = db;

    public Task<Newsletter?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        _db.Newsletters.FirstOrDefaultAsync(n => n.Email.ToLower() == email.ToLower(), ct);

    public async Task AddAsync(Newsletter newsletter, CancellationToken ct = default) =>
        await _db.Newsletters.AddAsync(newsletter, ct);
}

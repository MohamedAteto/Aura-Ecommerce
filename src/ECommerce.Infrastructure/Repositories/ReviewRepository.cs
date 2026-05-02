using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly AppDbContext _db;

    public ReviewRepository(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<Review>> GetByProductIdAsync(int productId, int limit, CancellationToken ct = default) =>
        await _db.Reviews.AsNoTracking()
            .Where(r => r.ProductId == productId)
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAtUtc)
            .Take(limit)
            .ToListAsync(ct);

    public Task<Review?> GetByUserAndProductAsync(int userId, int productId, CancellationToken ct = default) =>
        _db.Reviews.FirstOrDefaultAsync(r => r.UserId == userId && r.ProductId == productId, ct);

    public async Task AddAsync(Review review, CancellationToken ct = default) =>
        await _db.Reviews.AddAsync(review, ct);
}

using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces;

public interface IReviewRepository
{
    Task<IReadOnlyList<Review>> GetByProductIdAsync(int productId, int limit, CancellationToken ct = default);
    Task<Review?> GetByUserAndProductAsync(int userId, int productId, CancellationToken ct = default);
    Task AddAsync(Review review, CancellationToken ct = default);
}

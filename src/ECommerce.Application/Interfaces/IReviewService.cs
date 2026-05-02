using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface IReviewService
{
    Task<IReadOnlyList<ReviewDto>> GetProductReviewsAsync(int productId, int limit, CancellationToken ct = default);
    Task<ReviewDto> AddReviewAsync(int userId, int productId, AddReviewRequest request, CancellationToken ct = default);
}

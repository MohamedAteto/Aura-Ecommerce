using AutoMapper;
using ECommerce.Application.DTOs;
using ECommerce.Application.Exceptions;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviews;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ReviewService(IReviewRepository reviews, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _reviews = reviews;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<ReviewDto>> GetProductReviewsAsync(int productId, int limit, CancellationToken ct = default)
    {
        var reviews = await _reviews.GetByProductIdAsync(productId, limit, ct);
        return _mapper.Map<List<ReviewDto>>(reviews);
    }

    public async Task<ReviewDto> AddReviewAsync(int userId, int productId, AddReviewRequest request, CancellationToken ct = default)
    {
        var existing = await _reviews.GetByUserAndProductAsync(userId, productId, ct);
        if (existing is not null)
            throw new AppException("You have already reviewed this product.", 409);

        var review = new Review
        {
            ProductId = productId,
            UserId = userId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAtUtc = DateTime.UtcNow
        };
        await _reviews.AddAsync(review, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        var saved = await _reviews.GetByProductIdAsync(productId, 100, ct);
        var dto = saved.FirstOrDefault(r => r.UserId == userId);
        return dto is not null ? _mapper.Map<ReviewDto>(dto) : _mapper.Map<ReviewDto>(review);
    }
}

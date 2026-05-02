using ECommerce.Application.Common;
using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetProductsAsync(ProductQuery query, CancellationToken ct = default);
    Task<ProductDto> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<ProductSuggestionDto>> GetSuggestionsAsync(string q, CancellationToken ct = default);
    Task<IReadOnlyList<ProductDto>> GetRelatedAsync(int productId, int limit, CancellationToken ct = default);
    Task<IReadOnlyList<ReviewDto>> GetReviewsAsync(int productId, int limit, CancellationToken ct = default);
    Task<ReviewDto> AddReviewAsync(int userId, int productId, AddReviewRequest request, CancellationToken ct = default);
    Task<ProductDto> CreateAsync(ProductUpsertRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<ProductDto>> CreateBulkAsync(BulkProductRequest request, CancellationToken ct = default);
    Task<ProductDto> UpdateAsync(int id, ProductUpsertRequest request, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
    Task UpdateStockAsync(int productId, int? variationId, int quantity, CancellationToken ct = default);
}

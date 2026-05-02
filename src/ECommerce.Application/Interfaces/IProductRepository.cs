using ECommerce.Application.Common;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<PagedResult<Product>> GetPagedAsync(int page, int pageSize, int? categoryId, string? search, string? sort,
        decimal? minPrice, decimal? maxPrice, decimal? minRating, CancellationToken ct = default);
    Task<IReadOnlyList<Product>> GetSuggestionsAsync(string q, int limit, CancellationToken ct = default);
    Task<IReadOnlyList<Product>> GetRelatedAsync(int productId, int categoryId, int limit, CancellationToken ct = default);
    Task AddAsync(Product product, CancellationToken ct = default);
    void Update(Product product);
    void Remove(Product product);
    Task<int> CountAsync(CancellationToken ct = default);
}

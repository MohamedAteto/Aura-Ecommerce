using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces;

public interface ICategoryRepository
{
    Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken ct = default);
    Task<Category?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Category?> GetByIdTrackedAsync(int id, CancellationToken ct = default);
    Task<bool> SlugExistsAsync(string slug, int? exceptId, CancellationToken ct = default);
    Task<int> CountProductsAsync(int categoryId, CancellationToken ct = default);
    Task AddAsync(Category category, CancellationToken ct = default);
    void Update(Category category);
    void Remove(Category category);
}

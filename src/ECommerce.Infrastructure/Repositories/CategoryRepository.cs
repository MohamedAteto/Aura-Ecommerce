using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _db;

    public CategoryRepository(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken ct = default) =>
        await _db.Categories.AsNoTracking().OrderBy(c => c.Name).ToListAsync(ct);

    public Task<Category?> GetByIdAsync(int id, CancellationToken ct = default) =>
        _db.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, ct);

    public Task<Category?> GetByIdTrackedAsync(int id, CancellationToken ct = default) =>
        _db.Categories.FirstOrDefaultAsync(c => c.Id == id, ct);

    public Task<bool> SlugExistsAsync(string slug, int? exceptId, CancellationToken ct = default) =>
        _db.Categories.AnyAsync(c => c.Slug == slug && (exceptId == null || c.Id != exceptId), ct);

    public Task<int> CountProductsAsync(int categoryId, CancellationToken ct = default) =>
        _db.Products.CountAsync(p => p.CategoryId == categoryId, ct);

    public async Task AddAsync(Category category, CancellationToken ct = default) =>
        await _db.Categories.AddAsync(category, ct);

    public void Update(Category category) => _db.Categories.Update(category);

    public void Remove(Category category) => _db.Categories.Remove(category);
}

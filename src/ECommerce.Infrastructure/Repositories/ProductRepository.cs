using ECommerce.Application.Common;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _db;

    public ProductRepository(AppDbContext db) => _db = db;

    public Task<Product?> GetByIdAsync(int id, CancellationToken ct = default) =>
        _db.Products
            .Include(p => p.Category)
            .Include(p => p.Variations)
            .Include(p => p.Reviews).ThenInclude(r => r.User)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<PagedResult<Product>> GetPagedAsync(int page, int pageSize, int? categoryId, string? search, string? sort,
        decimal? minPrice, decimal? maxPrice, decimal? minRating, CancellationToken ct = default)
    {
        var q = _db.Products.AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Variations)
            .Include(p => p.Reviews)
            .AsQueryable();

        if (categoryId is not null)
            q = q.Where(p => p.CategoryId == categoryId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            q = q.Where(p => p.Name.ToLower().Contains(s) || p.Description.ToLower().Contains(s));
        }

        if (minPrice.HasValue)
            q = q.Where(p => p.Price >= minPrice.Value);

        if (maxPrice.HasValue)
            q = q.Where(p => p.Price <= maxPrice.Value);

        if (minRating.HasValue)
            q = q.Where(p => p.Reviews.Count > 0 && p.Reviews.Average(r => r.Rating) >= (double)minRating.Value);

        if (string.Equals(sort, "desc", StringComparison.OrdinalIgnoreCase) || string.Equals(sort, "high", StringComparison.OrdinalIgnoreCase))
            q = q.OrderByDescending(p => p.Price);
        else
            q = q.OrderBy(p => p.Price);

        var total = await q.CountAsync(ct);
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return new PagedResult<Product> { Items = items, Page = page, PageSize = pageSize, TotalCount = total };
    }

    public async Task<IReadOnlyList<Product>> GetSuggestionsAsync(string q, int limit, CancellationToken ct = default)
    {
        var term = q.Trim().ToLower();
        return await _db.Products.AsNoTracking()
            .Where(p => p.Name.ToLower().Contains(term))
            .OrderBy(p => p.Name)
            .Take(limit)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Product>> GetRelatedAsync(int productId, int categoryId, int limit, CancellationToken ct = default) =>
        await _db.Products.AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Variations)
            .Include(p => p.Reviews)
            .Where(p => p.CategoryId == categoryId && p.Id != productId)
            .OrderBy(p => p.Id)
            .Take(limit)
            .ToListAsync(ct);

    public async Task AddAsync(Product product, CancellationToken ct = default) =>
        await _db.Products.AddAsync(product, ct);

    public void Update(Product product) => _db.Products.Update(product);

    public void Remove(Product product) => _db.Products.Remove(product);

    public Task<int> CountAsync(CancellationToken ct = default) => _db.Products.CountAsync(ct);
}

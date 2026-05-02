using System.Text.RegularExpressions;
using ECommerce.Application.DTOs;
using ECommerce.Application.Exceptions;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categories;
    private readonly IUnitOfWork _unitOfWork;

    public CategoryService(ICategoryRepository categories, IUnitOfWork unitOfWork)
    {
        _categories = categories;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync(CancellationToken ct = default)
    {
        var list = await _categories.GetAllAsync(ct);
        return list.Select(c => new CategoryDto { Id = c.Id, Name = c.Name, Slug = c.Slug }).ToList();
    }

    public async Task<CategoryDto> CreateAsync(CategoryUpsertRequest request, CancellationToken ct = default)
    {
        var name = request.Name.Trim();
        var slug = await EnsureUniqueSlug(string.IsNullOrWhiteSpace(request.Slug) ? Slugify(name) : Slugify(request.Slug!), null, ct);
        var entity = new Category { Name = name, Slug = slug };
        await _categories.AddAsync(entity, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return new CategoryDto { Id = entity.Id, Name = entity.Name, Slug = entity.Slug };
    }

    public async Task<CategoryDto> UpdateAsync(int id, CategoryUpsertRequest request, CancellationToken ct = default)
    {
        var entity = await _categories.GetByIdTrackedAsync(id, ct) ?? throw new AppException("Category not found.", 404);
        var name = request.Name.Trim();
        entity.Name = name;
        var baseSlug = string.IsNullOrWhiteSpace(request.Slug) ? Slugify(name) : Slugify(request.Slug!);
        entity.Slug = await EnsureUniqueSlug(baseSlug, id, ct);
        _categories.Update(entity);
        await _unitOfWork.SaveChangesAsync(ct);
        return new CategoryDto { Id = entity.Id, Name = entity.Name, Slug = entity.Slug };
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var count = await _categories.CountProductsAsync(id, ct);
        if (count > 0)
            throw new AppException("Cannot delete a category that still has products. Reassign or delete those products first.");

        var entity = await _categories.GetByIdTrackedAsync(id, ct) ?? throw new AppException("Category not found.", 404);
        _categories.Remove(entity);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private async Task<string> EnsureUniqueSlug(string baseSlug, int? exceptId, CancellationToken ct)
    {
        var slug = baseSlug;
        var n = 2;
        while (await _categories.SlugExistsAsync(slug, exceptId, ct))
        {
            slug = $"{baseSlug}-{n++}";
        }
        return slug;
    }

    private static string Slugify(string input)
    {
        var s = input.Trim().ToLowerInvariant();
        s = Regex.Replace(s, @"[^a-z0-9\s-]", "");
        s = Regex.Replace(s, @"\s+", "-", RegexOptions.Compiled);
        s = Regex.Replace(s, "-{2,}", "-", RegexOptions.Compiled).Trim('-');
        return string.IsNullOrEmpty(s) ? "category" : s;
    }
}

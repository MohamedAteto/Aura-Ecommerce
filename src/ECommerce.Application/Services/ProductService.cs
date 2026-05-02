using AutoMapper;
using ECommerce.Application.Common;
using ECommerce.Application.DTOs;
using ECommerce.Application.Exceptions;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _products;
    private readonly ICategoryRepository _categories;
    private readonly IReviewRepository _reviews;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ProductService(IProductRepository products, ICategoryRepository categories,
        IReviewRepository reviews, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _products = products;
        _categories = categories;
        _reviews = reviews;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PagedResult<ProductDto>> GetProductsAsync(ProductQuery query, CancellationToken ct = default)
    {
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 200);
        var result = await _products.GetPagedAsync(page, pageSize, query.CategoryId, query.Search, query.Sort,
            query.MinPrice, query.MaxPrice, query.MinRating, ct);
        return new PagedResult<ProductDto>
        {
            Items = _mapper.Map<List<ProductDto>>(result.Items),
            Page = page,
            PageSize = pageSize,
            TotalCount = result.TotalCount
        };
    }

    public async Task<ProductDto> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var p = await _products.GetByIdAsync(id, ct) ?? throw new AppException("Product not found.", 404);
        return _mapper.Map<ProductDto>(p);
    }

    public async Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken ct = default)
    {
        var list = await _categories.GetAllAsync(ct);
        return list.Select(c => new CategoryDto { Id = c.Id, Name = c.Name, Slug = c.Slug }).ToList();
    }

    public async Task<IReadOnlyList<ProductSuggestionDto>> GetSuggestionsAsync(string q, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(q)) return Array.Empty<ProductSuggestionDto>();
        var products = await _products.GetSuggestionsAsync(q, 5, ct);
        return products.Select(p => new ProductSuggestionDto { Id = p.Id, Name = p.Name }).ToList();
    }

    public async Task<IReadOnlyList<ProductDto>> GetRelatedAsync(int productId, int limit, CancellationToken ct = default)
    {
        var product = await _products.GetByIdAsync(productId, ct) ?? throw new AppException("Product not found.", 404);
        var related = await _products.GetRelatedAsync(productId, product.CategoryId, limit, ct);
        return _mapper.Map<List<ProductDto>>(related);
    }

    public async Task<IReadOnlyList<ReviewDto>> GetReviewsAsync(int productId, int limit, CancellationToken ct = default)
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

        // Reload with user
        var saved = await _reviews.GetByProductIdAsync(productId, 1, ct);
        var dto = saved.FirstOrDefault(r => r.UserId == userId && r.ProductId == productId);
        return dto is not null ? _mapper.Map<ReviewDto>(dto) : _mapper.Map<ReviewDto>(review);
    }

    public async Task<ProductDto> CreateAsync(ProductUpsertRequest request, CancellationToken ct = default)
    {
        await EnsureCategoryExists(request.CategoryId, ct);
        var entity = new Product
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            Price = request.Price,
            ImageUrl = request.ImageUrl.Trim(),
            CategoryId = request.CategoryId,
            StockQuantity = request.StockQuantity
        };

        if (request.Variations != null)
        {
            foreach (var v in request.Variations)
            {
                entity.Variations.Add(new ProductVariation
                {
                    Size = v.Size,
                    Color = v.Color,
                    StockQuantity = v.StockQuantity,
                    PriceDelta = v.PriceDelta
                });
            }
        }

        await _products.AddAsync(entity, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        var reloaded = await _products.GetByIdAsync(entity.Id, ct) ?? entity;
        return _mapper.Map<ProductDto>(reloaded);
    }

    public async Task<ProductDto> UpdateAsync(int id, ProductUpsertRequest request, CancellationToken ct = default)
    {
        var entity = await _products.GetByIdAsync(id, ct) ?? throw new AppException("Product not found.", 404);
        await EnsureCategoryExists(request.CategoryId, ct);
        entity.Name = request.Name.Trim();
        entity.Description = request.Description.Trim();
        entity.Price = request.Price;
        entity.ImageUrl = request.ImageUrl.Trim();
        entity.CategoryId = request.CategoryId;
        entity.StockQuantity = request.StockQuantity;

        if (request.Variations != null)
        {
            // Remove variations not in request
            var requestIds = request.Variations.Where(v => v.Id.HasValue).Select(v => v.Id!.Value).ToHashSet();
            var toRemove = entity.Variations.Where(v => !requestIds.Contains(v.Id)).ToList();
            foreach (var v in toRemove) entity.Variations.Remove(v);

            foreach (var vReq in request.Variations)
            {
                if (vReq.Id.HasValue)
                {
                    var existing = entity.Variations.FirstOrDefault(v => v.Id == vReq.Id.Value);
                    if (existing != null)
                    {
                        existing.Size = vReq.Size;
                        existing.Color = vReq.Color;
                        existing.StockQuantity = vReq.StockQuantity;
                        existing.PriceDelta = vReq.PriceDelta;
                    }
                }
                else
                {
                    entity.Variations.Add(new ProductVariation
                    {
                        Size = vReq.Size,
                        Color = vReq.Color,
                        StockQuantity = vReq.StockQuantity,
                        PriceDelta = vReq.PriceDelta
                    });
                }
            }
        }

        _products.Update(entity);
        await _unitOfWork.SaveChangesAsync(ct);
        var reloaded = await _products.GetByIdAsync(id, ct) ?? entity;
        return _mapper.Map<ProductDto>(reloaded);
    }

    public async Task<IReadOnlyList<ProductDto>> CreateBulkAsync(BulkProductRequest request, CancellationToken ct = default)
    {
        var list = new List<ProductDto>();
        foreach (var item in request.Items)
        {
            list.Add(await CreateAsync(item, ct));
        }
        return list;
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _products.GetByIdAsync(id, ct) ?? throw new AppException("Product not found.", 404);
        _products.Remove(entity);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    public async Task UpdateStockAsync(int productId, int? variationId, int quantity, CancellationToken ct = default)
    {
        var entity = await _products.GetByIdAsync(productId, ct) ?? throw new AppException("Product not found.", 404);
        if (variationId.HasValue)
        {
            var variation = entity.Variations.FirstOrDefault(v => v.Id == variationId.Value)
                ?? throw new AppException("Variation not found.", 404);
            variation.StockQuantity = quantity;
        }
        else
        {
            entity.StockQuantity = quantity;
        }
        _products.Update(entity);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private async Task EnsureCategoryExists(int categoryId, CancellationToken ct)
    {
        var c = await _categories.GetByIdAsync(categoryId, ct);
        if (c is null) throw new AppException("Invalid category.");
    }
}

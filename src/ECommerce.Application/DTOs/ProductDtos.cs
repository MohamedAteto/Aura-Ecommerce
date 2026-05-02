namespace ECommerce.Application.DTOs;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
}

public class ProductVariationDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string? Size { get; set; }
    public string? Color { get; set; }
    public int StockQuantity { get; set; }
    public decimal PriceDelta { get; set; }
}

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = null!;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = null!;
    public decimal AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public bool InStock { get; set; }
    public int StockQuantity { get; set; }
    public List<ProductVariationDto> Variations { get; set; } = new();
}

public class ProductSuggestionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
}

public class ProductQuery
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
    public int? CategoryId { get; set; }
    public string? Search { get; set; }
    public string? Sort { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public decimal? MinRating { get; set; }
}

public class ProductUpsertRequest
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = null!;
    public int CategoryId { get; set; }
    public int StockQuantity { get; set; }
    public List<UpsertVariationRequest>? Variations { get; set; }
}

public class UpsertVariationRequest
{
    public int? Id { get; set; }
    public string? Size { get; set; }
    public string? Color { get; set; }
    public int StockQuantity { get; set; }
    public decimal PriceDelta { get; set; }
}

public class UpdateStockRequest
{
    public int Quantity { get; set; }
    public int? VariationId { get; set; }
}

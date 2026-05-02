namespace ECommerce.Application.DTOs;

public class CategoryUpsertRequest
{
    public string Name { get; set; } = null!;
    public string? Slug { get; set; }
}

public class BulkProductRequest
{
    public List<ProductUpsertRequest> Items { get; set; } = new();
}

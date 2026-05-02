namespace ECommerce.Domain.Entities;

public class ProductVariation
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string? Size { get; set; }        // max 50
    public string? Color { get; set; }       // max 50
    public int StockQuantity { get; set; }
    public decimal PriceDelta { get; set; }  // default 0
}

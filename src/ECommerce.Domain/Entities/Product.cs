namespace ECommerce.Domain.Entities;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = null!;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public int StockQuantity { get; set; }

    public ICollection<ProductVariation> Variations { get; set; } = new List<ProductVariation>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

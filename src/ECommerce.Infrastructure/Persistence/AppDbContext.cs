using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductVariation> ProductVariations => Set<ProductVariation>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Discount> Discounts => Set<Discount>();
    public DbSet<Newsletter> Newsletters => Set<Newsletter>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(b =>
        {
            b.HasIndex(x => x.Email).IsUnique();
            b.Property(x => x.Email).HasMaxLength(256);
            b.Property(x => x.FullName).HasMaxLength(120);
            b.Property(x => x.Role).HasMaxLength(32);
        });

        modelBuilder.Entity<Category>(b =>
        {
            b.HasIndex(x => x.Slug).IsUnique();
            b.Property(x => x.Name).HasMaxLength(120);
            b.Property(x => x.Slug).HasMaxLength(120);
        });

        modelBuilder.Entity<Product>(b =>
        {
            b.Property(x => x.Name).HasMaxLength(200);
            b.Property(x => x.Description).HasMaxLength(4000);
            b.Property(x => x.ImageUrl).HasMaxLength(2000);
            b.Property(x => x.Price).HasPrecision(18, 2);
            b.Property(x => x.StockQuantity).HasDefaultValue(0);
        });

        modelBuilder.Entity<ProductVariation>(b =>
        {
            b.Property(x => x.Size).HasMaxLength(50);
            b.Property(x => x.Color).HasMaxLength(50);
            b.Property(x => x.PriceDelta).HasPrecision(18, 2).HasDefaultValue(0m);
            b.HasOne(x => x.Product)
                .WithMany(p => p.Variations)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Review>(b =>
        {
            b.Property(x => x.Comment).HasMaxLength(1000);
            b.HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();
            b.HasOne(x => x.Product)
                .WithMany(p => p.Reviews)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
            b.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CartItem>(b =>
        {
            b.HasIndex(x => new { x.UserId, x.ProductId, x.VariationId }).IsUnique();
            b.HasOne(x => x.Variation)
                .WithMany()
                .HasForeignKey(x => x.VariationId)
                .OnDelete(DeleteBehavior.NoAction)
                .IsRequired(false);
        });

        modelBuilder.Entity<Order>(b =>
        {
            b.Property(x => x.Status).HasMaxLength(64);
            b.Property(x => x.TotalAmount).HasPrecision(18, 2);
            b.Property(x => x.CouponCode).HasMaxLength(50);
            b.Property(x => x.DiscountAmount).HasPrecision(18, 2).HasDefaultValue(0m);
        });

        modelBuilder.Entity<OrderItem>(b =>
        {
            b.Property(x => x.ProductName).HasMaxLength(200);
            b.Property(x => x.UnitPrice).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Discount>(b =>
        {
            b.HasIndex(x => x.Code).IsUnique();
            b.Property(x => x.Code).HasMaxLength(50);
            b.Property(x => x.Type).HasMaxLength(32);
            b.Property(x => x.Value).HasPrecision(18, 2);
            b.Property(x => x.MinOrderAmount).HasPrecision(18, 2).HasDefaultValue(0m);
        });

        modelBuilder.Entity<Newsletter>(b =>
        {
            b.HasIndex(x => x.Email).IsUnique();
            b.Property(x => x.Email).HasMaxLength(256);
        });
    }
}

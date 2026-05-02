using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace ECommerce.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider services, ILogger logger, CancellationToken ct = default)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        await db.Database.MigrateAsync(ct);

        // Fix stock on existing products
        var noStock = await db.Products.Where(p => p.StockQuantity == 0).ToListAsync(ct);
        if (noStock.Any())
        {
            var rng = new Random(42);
            foreach (var p in noStock) p.StockQuantity = rng.Next(15, 80);
            await db.SaveChangesAsync(ct);
        }

        if (!await db.Categories.AnyAsync(ct))
        {
            var cats = new[] {
                new Category { Name="Electronics",   Slug="electronics" },
                new Category { Name="Fashion",       Slug="fashion" },
                new Category { Name="Home & Living", Slug="home" },
                new Category { Name="Sports",        Slug="sports" },
                new Category { Name="Books",         Slug="books" },
                new Category { Name="Beauty",        Slug="beauty" },
            };
            db.Categories.AddRange(cats);
            await db.SaveChangesAsync(ct);
            int e=cats[0].Id, f=cats[1].Id, h=cats[2].Id, s=cats[3].Id, b=cats[4].Id, be=cats[5].Id;
            await SeedProducts(db, e, f, h, s, b, be, ct);
            logger.LogInformation("Seeded categories and products.");
        }

        if (!await db.Users.AnyAsync(u => u.Email == "admin@shop.com", ct))
        {
            db.Users.Add(new User { Email="admin@shop.com", FullName="Store Admin", PasswordHash=passwordHasher.Hash("Admin123!"), Role=Roles.Admin });
            await db.SaveChangesAsync(ct);
        }
    }

    private static async Task SeedProducts(AppDbContext db, int e, int f, int h, int s, int b, int be, CancellationToken ct)
    {
        var products = new List<Product> {
            new(){Name="Noise-Cancelling Headphones",Description="Premium ANC, 30h battery, Hi-Res audio.",Price=249.99m,StockQuantity=45,ImageUrl="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",CategoryId=e},
            new(){Name="Smart Watch Ultra",Description="GPS, heart rate, sleep tracking, sapphire glass.",Price=429.00m,StockQuantity=30,ImageUrl="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",CategoryId=e},
            new(){Name="Wireless Earbuds Pro",Description="True wireless, 8h playback, IPX5, fast charging.",Price=149.99m,StockQuantity=60,ImageUrl="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",CategoryId=e},
            new(){Name="4K Mirrorless Camera",Description="24MP sensor, 4K video, in-body stabilisation.",Price=1299.00m,StockQuantity=15,ImageUrl="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",CategoryId=e},
            new(){Name="Mechanical Keyboard",Description="TKL, Cherry MX switches, RGB, aluminium frame.",Price=189.00m,StockQuantity=40,ImageUrl="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",CategoryId=e},
            new(){Name="Ultra-Wide Monitor 34\"",Description="3440x1440 IPS, 144Hz, HDR400, USB-C 90W.",Price=699.00m,StockQuantity=20,ImageUrl="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",CategoryId=e},
            new(){Name="Portable SSD 2TB",Description="USB 3.2 Gen2, 1050 MB/s read, shock-resistant.",Price=119.99m,StockQuantity=80,ImageUrl="https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80",CategoryId=e},
            new(){Name="Smart Home Hub",Description="Controls 100+ devices, voice assistant, Zigbee.",Price=89.99m,StockQuantity=35,ImageUrl="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",CategoryId=e},
        };
        db.Products.AddRange(products);
        await db.SaveChangesAsync(ct);
    }
}

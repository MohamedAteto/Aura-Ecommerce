# Design Document — AURA E-Commerce Platform Upgrade

## Overview

This upgrade extends the existing clean-architecture ASP.NET Core + React (Vite) stack without breaking what already works. The backend gains a unified response envelope, AutoMapper, four new domain entities, and a proper order-status workflow. The frontend gains a full Admin module, polished UI components, and cart-login sync.

**Existing stack preserved:** Clean architecture (Domain / Application / Infrastructure / API), Unit of Work, FluentValidation, JWT role-based auth, pagination, global error middleware, persistent DB cart, Framer Motion, Bootstrap 5 dark theme.

---

## Architecture

### Backend

```
ECommerce.Domain          ← entities only, no dependencies
ECommerce.Application     ← interfaces, DTOs, services, validators, AutoMapper profiles
ECommerce.Infrastructure  ← EF Core, repositories, UoW, security
ECommerce.API             ← controllers, middleware, Program.cs
```

**Key decisions:**

- `ApiResponse<T>` wrapper is applied at the controller level via a base controller or action filter — not inside services. Services continue to return plain DTOs and throw `AppException` on errors.
- AutoMapper profiles live in `ECommerce.Application/Mappings/`. Registered via `services.AddAutoMapper(typeof(DependencyInjection).Assembly)` in `DependencyInjection.cs`.
- New entities (`Review`, `ProductVariation`, `Discount`, `Newsletter`) are added to `ECommerce.Domain/Entities/` and configured in `AppDbContext`.
- `OrderStatuses` static class is replaced with the new six-state enum string constants: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`, `Failed`.
- Stock decrement happens inside `OrderService.CheckoutAsync` in the same `SaveChangesAsync` call — no separate transaction needed because EF Core wraps the save in a transaction by default.

### Frontend

```
client/src/
  api/           ← axios client, media helper
  components/    ← shared UI (Navbar, ProductCard, Layout, new: AdminLayout, EmptyState, SearchBar, StatusStepper, ReviewForm, StarRating)
  context/       ← AuthContext (extended for cart sync on login)
  pages/         ← route-level pages (new: admin sub-pages)
  App.jsx        ← routes (extended with /admin/* nested routes)
```

**Key decisions:**

- Admin section uses a separate `AdminLayout` with a sidebar — it replaces the main `Layout` for all `/admin/*` routes, so the shopper Navbar is never shown inside admin.
- Guest cart lives in `localStorage['guest_cart']`. Sync is triggered inside `AuthContext.login()` immediately after the JWT is stored, before navigation.
- `lucide-react` replaces all emoji/unicode icons. No other icon library is introduced.
- Recharts is used for dashboard charts (already a common React charting library; no Chart.js to avoid two charting deps).

---

## Components and Interfaces

### New Backend Interfaces

```csharp
// IReviewService
Task<IReadOnlyList<ReviewDto>> GetProductReviewsAsync(int productId, CancellationToken ct);
Task<ReviewDto> AddReviewAsync(int userId, int productId, AddReviewRequest request, CancellationToken ct);

// IDiscountService
Task<ApplyCouponResult> ApplyCouponAsync(int userId, string code, CancellationToken ct);
Task<DiscountDto> CreateCouponAsync(UpsertCouponRequest request, CancellationToken ct);
Task<DiscountDto> UpdateCouponAsync(int id, UpsertCouponRequest request, CancellationToken ct);
Task DeleteCouponAsync(int id, CancellationToken ct);
Task<IReadOnlyList<DiscountDto>> GetAllCouponsAsync(CancellationToken ct);

// INewsletterService
Task<string> SubscribeAsync(string email, CancellationToken ct); // returns message string

// Extended ICartService (additions)
Task<CartSyncResult> SyncGuestCartAsync(int userId, IReadOnlyList<GuestCartItem> items, CancellationToken ct);

// Extended IOrderService (additions)
Task<PagedResult<OrderDto>> GetMyOrdersPagedAsync(int userId, int page, int pageSize, CancellationToken ct);
Task<OrderDto> AdvanceStatusAsync(int orderId, string newStatus, CancellationToken ct);

// Extended IAdminService (additions)
Task<DashboardDto> GetDashboardAsync(CancellationToken ct);
Task UpdateStockAsync(int productId, int? variationId, int quantity, CancellationToken ct);
Task<OrderDto> AdvanceOrderStatusAsync(int orderId, string newStatus, CancellationToken ct);
```

### New API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/Products/suggestions?q=` | Public | Up to 5 name suggestions |
| GET | `/api/Products/{id}/reviews` | Public | 10 most recent reviews |
| POST | `/api/Products/{id}/reviews` | User | Submit review |
| GET | `/api/Products/{id}/related?limit=4` | Public | Related products (same category) |
| POST | `/api/Cart/apply-coupon` | User | Validate & apply coupon |
| POST | `/api/Cart/sync` | User | Merge guest cart on login |
| GET | `/api/Orders/my` | User | Paginated order history |
| PATCH | `/api/Admin/orders/{id}/status` | Admin | Advance order status |
| GET | `/api/Admin/dashboard` | Admin | KPI + chart data |
| PATCH | `/api/Admin/products/{id}/stock` | Admin | Update stock quantity |
| GET | `/api/Admin/coupons` | Admin | List all coupons |
| POST | `/api/Admin/coupons` | Admin | Create coupon |
| PUT | `/api/Admin/coupons/{id}` | Admin | Update coupon |
| DELETE | `/api/Admin/coupons/{id}` | Admin | Delete coupon |
| POST | `/api/Newsletter/subscribe` | Public | Newsletter signup |

### New Frontend Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `AdminLayout` | `components/AdminLayout.jsx` | Sidebar + outlet for all `/admin/*` routes |
| `EmptyState` | `components/EmptyState.jsx` | Icon + message + optional CTA button |
| `SearchBar` | `components/SearchBar.jsx` | Debounced input with suggestions dropdown |
| `StatusStepper` | `components/StatusStepper.jsx` | Horizontal step indicator for order status |
| `ReviewForm` | `components/ReviewForm.jsx` | Star picker + comment textarea + submit |
| `StarRating` | `components/StarRating.jsx` | Read-only star display using Lucide `Star`/`StarHalf` |
| `SkeletonCard` | `components/SkeletonCard.jsx` | Single card skeleton (used by existing `SkeletonGrid`) |
| `KpiCard` | `components/KpiCard.jsx` | Admin dashboard metric tile |

---

## Data Models

### New Domain Entities

```csharp
// ECommerce.Domain/Entities/Review.cs
public class Review {
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int Rating { get; set; }          // 1–5
    public string? Comment { get; set; }     // max 1000 chars
    public DateTime CreatedAtUtc { get; set; }
}

// ECommerce.Domain/Entities/ProductVariation.cs
public class ProductVariation {
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string? Size { get; set; }        // max 50
    public string? Color { get; set; }       // max 50
    public int StockQuantity { get; set; }
    public decimal PriceDelta { get; set; }  // default 0
}

// ECommerce.Domain/Entities/Discount.cs
public class Discount {
    public int Id { get; set; }
    public string Code { get; set; } = null!;   // unique, case-insensitive
    public string Type { get; set; } = null!;   // "Percentage" | "FixedAmount"
    public decimal Value { get; set; }
    public decimal MinOrderAmount { get; set; }
    public int? MaxUses { get; set; }
    public int UsedCount { get; set; }
    public DateTime? ExpiresAtUtc { get; set; }
    public bool IsActive { get; set; }
}

// ECommerce.Domain/Entities/Newsletter.cs
public class Newsletter {
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public DateTime SubscribedAtUtc { get; set; }
}
```

### Extended Existing Entities

```csharp
// Product additions
public int StockQuantity { get; set; }
public ICollection<ProductVariation> Variations { get; set; }
public ICollection<Review> Reviews { get; set; }

// CartItem additions
public int? VariationId { get; set; }
public ProductVariation? Variation { get; set; }

// Order additions — status constants updated
public string? CouponCode { get; set; }
public decimal DiscountAmount { get; set; }
// OrderStatuses updated: Pending, Processing, Shipped, Delivered, Cancelled, Failed
```

### Updated DTOs

```csharp
// ProductDto additions
public decimal AverageRating { get; set; }
public int ReviewCount { get; set; }
public bool InStock { get; set; }
public List<ProductVariationDto> Variations { get; set; }

// CartItemDto additions
public int? VariationId { get; set; }
public string? VariationLabel { get; set; }  // e.g. "M / Red"

// CartResponseDto (new — returned by GET /api/Cart, apply-coupon, sync)
public List<CartItemDto> Items { get; set; }
public decimal Subtotal { get; set; }
public decimal DiscountAmount { get; set; }
public string? CouponCode { get; set; }
public decimal Total { get; set; }

// OrderDto additions
public string? CouponCode { get; set; }
public decimal DiscountAmount { get; set; }

// DashboardDto (new)
public decimal TotalRevenue { get; set; }
public int TotalOrders { get; set; }
public int TotalUsers { get; set; }
public int TotalProducts { get; set; }
public List<RevenueByDayDto> RevenueByDay { get; set; }   // last 30 days
public List<OrdersByStatusDto> OrdersByStatus { get; set; }
public List<TopProductDto> TopProducts { get; set; }       // top 5 by revenue
```

### AutoMapper Profiles

One profile class per domain area in `ECommerce.Application/Mappings/`:

- `ProductMappingProfile` — `Product → ProductDto`, `ProductVariation → ProductVariationDto`, `Review → ReviewDto`
- `OrderMappingProfile` — `Order → OrderDto`, `OrderItem → OrderItemDto`
- `CartMappingProfile` — `CartItem → CartItemDto`
- `DiscountMappingProfile` — `Discount → DiscountDto`
- `UserMappingProfile` — `User → UserDto` (admin user list)

---

## Key Data Flow Decisions

### Cart Sync on Login

```
User logs in
  → AuthContext.login() stores JWT
  → reads localStorage['guest_cart']
  → if non-empty: POST /api/Cart/sync with items array
  → CartService.SyncGuestCartAsync merges by (productId + variationId):
      existing item → add quantities
      new item      → insert CartItem
  → returns merged CartResponseDto
  → AuthContext clears localStorage['guest_cart']
  → navigate to destination
```

### Order Status Transitions

Valid transitions enforced in `OrderService.AdvanceStatusAsync`:

```
Pending     → Processing | Cancelled
Processing  → Shipped    | Cancelled
Shipped     → Delivered
Delivered   → (terminal)
Cancelled   → (terminal)
Failed      → (terminal)
```

Any other transition throws `AppException("Invalid status transition from {current} to {requested}.", 400)`.

### Checkout with Discount

```
POST /api/Orders/checkout
  → load cart items
  → if coupon applied (stored on session/cart): validate still active
  → calculate subtotal
  → apply discount (percentage or fixed, capped at subtotal)
  → decrement stock (Product.StockQuantity or ProductVariation.StockQuantity)
  → increment Discount.UsedCount
  → create Order with CouponCode + DiscountAmount
  → clear cart
  → SaveChangesAsync (single transaction)
```

**Decision:** Coupon is stored on the `CartItem` aggregate as a transient field (not persisted) — the applied coupon code is kept in React state on the Cart page and sent with the checkout request body `{ couponCode }`. This avoids a separate `AppliedCoupon` table.

### ApiResponse Envelope

A base controller `ApiControllerBase` provides helper methods:

```csharp
protected IActionResult Ok<T>(T data, string message = "") =>
    base.Ok(new ApiResponse<T>(true, data, message));

protected IActionResult Created<T>(string location, T data) =>
    base.Created(location, new ApiResponse<T>(true, data, ""));
```

`ExceptionMiddleware` is updated to always return `ApiResponse`-shaped bodies (already returns `{ error, code }` — updated to `{ success: false, data: null, message }`).

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Order status transition validity

*For any* order in any non-terminal status, only the transitions defined in the workflow table SHALL succeed; all other requested transitions SHALL be rejected with HTTP 400.

**Validates: Requirements 7.4, 7.5**

### Property 2: Stock decrement on checkout

*For any* set of cart items, after a successful checkout the stock quantity of each involved product (or variation) SHALL be reduced by exactly the ordered quantity, and the sum of all decrements SHALL equal the sum of ordered quantities.

**Validates: Requirements 5.4**

### Property 3: Coupon usage count monotonicity

*For any* coupon with a finite `MaxUses`, after N successful checkouts using that coupon, `UsedCount` SHALL equal N, and the (N+1)th application SHALL be rejected.

**Validates: Requirements 6.4, 6.7**

### Property 4: Cart sync idempotency

*For any* guest cart and any authenticated user cart, syncing the same guest cart twice SHALL produce the same final cart state as syncing it once (quantities are not doubled on the second sync if the first already merged them).

**Validates: Requirements 8.3**

### Property 5: Review uniqueness per user-product pair

*For any* user and product, submitting a second review SHALL be rejected with HTTP 409; the review count for that product SHALL remain unchanged.

**Validates: Requirements 3.3**

### Property 6: ApiResponse envelope completeness

*For any* API endpoint response (success or error), the response body SHALL contain exactly the fields `success`, `data`, and `message` at the top level.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

---

## Error Handling

| Scenario | HTTP Status | Message |
|----------|-------------|---------|
| Product not found | 404 | "Product not found." |
| Variant out of stock | 400 | "This variant is out of stock." |
| Insufficient stock | 400 | "Insufficient stock. Only {n} unit(s) available." |
| Duplicate review | 409 | "You have already reviewed this product." |
| Invalid coupon | 400 | "Invalid or expired coupon code." |
| Coupon usage limit | 400 | "This coupon has reached its usage limit." |
| Coupon min order | 400 | "Minimum order amount of {amount} required for this coupon." |
| Invalid status transition | 400 | "Invalid status transition from {current} to {requested}." |
| Already subscribed | 200 | "You are already subscribed." |
| Invalid email | 400 | "Please enter a valid email address." |
| Unauthenticated | 401 | "Unauthorized." |
| Forbidden | 403 | "Forbidden." |
| Validation failure | 400 | `{ success: false, data: { errors: {...} }, message: "Validation failed" }` |

All errors flow through `ExceptionMiddleware` — services throw `AppException(message, statusCode)` and validators throw `ValidationException`.

---

## Testing Strategy

### Unit Tests (xUnit)

Focus on service logic with mocked repositories:

- `OrderService`: status transition matrix (valid and invalid paths)
- `CartService`: sync merge logic, stock validation
- `DiscountService`: coupon validation rules (expired, usage limit, min amount)
- `ReviewService`: duplicate review rejection
- AutoMapper profile configuration (`.AssertConfigurationIsValid()`)

### Property-Based Tests (FsCheck or CsCheck)

- **Property 1** — Generate random `(currentStatus, requestedStatus)` pairs; assert only valid transitions succeed.
- **Property 2** — Generate random cart item lists with stock quantities; assert post-checkout stock equals pre-checkout stock minus ordered quantity.
- **Property 3** — Generate random coupon with `MaxUses = N`; simulate N+1 checkouts; assert exactly N succeed.
- **Property 4** — Generate random guest cart + user cart; sync twice; assert final state equals single-sync state.
- **Property 5** — Generate random `(userId, productId)` pairs; submit two reviews; assert second is rejected and count unchanged.
- **Property 6** — Generate random endpoint calls; deserialize response; assert top-level shape always matches `ApiResponse<T>`.

Each property test runs minimum 100 iterations.
Tag format: `// Feature: ecommerce-platform-upgrade, Property {N}: {property_text}`

### Integration Tests

- `GET /api/Admin/dashboard` returns all required fields
- `POST /api/Newsletter/subscribe` with duplicate email returns 200 (not 409)
- `POST /api/Cart/sync` with empty array skips DB write

### Frontend Tests (Vitest + React Testing Library)

- `StatusStepper` renders correct active step for each status value
- `EmptyState` renders icon, message, and CTA link
- `SearchBar` debounces API calls (mock timer)
- `ReviewForm` disables submit while loading; shows error on failure

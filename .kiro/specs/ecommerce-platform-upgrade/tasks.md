# Tasks — AURA E-Commerce Platform Upgrade

## Phase 1: Backend Foundation

- [ ] 1.1 Add `ApiResponse<T>` wrapper class to `ECommerce.Application/Common/`
- [ ] 1.2 Create `ApiControllerBase` in `ECommerce.API/Controllers/` with `Ok<T>`, `Created<T>`, `NoContent`, `BadRequest<T>` helpers that wrap in `ApiResponse<T>`
- [ ] 1.3 Update `ExceptionMiddleware` to return `{ success: false, data: null, message: "..." }` shape for all errors (AppException, ValidationException, unhandled)
- [ ] 1.4 Migrate all existing controllers to inherit `ApiControllerBase` and use the new response helpers
- [ ] 1.5 Install `AutoMapper` NuGet package in `ECommerce.Application` and `ECommerce.API`
- [ ] 1.6 Create `ECommerce.Application/Mappings/` folder and add `ProductMappingProfile`, `OrderMappingProfile`, `CartMappingProfile`
- [ ] 1.7 Register AutoMapper in `DependencyInjection.cs` via `services.AddAutoMapper(typeof(DependencyInjection).Assembly)`
- [ ] 1.8 Replace manual `Map()` methods in `ProductService`, `OrderService`, `CartService` with `IMapper.Map<T>`

## Phase 2: New Domain Entities

- [ ] 2.1 Add `Review` entity to `ECommerce.Domain/Entities/Review.cs`
- [ ] 2.2 Add `ProductVariation` entity to `ECommerce.Domain/Entities/ProductVariation.cs`
- [ ] 2.3 Add `Discount` entity to `ECommerce.Domain/Entities/Discount.cs`
- [ ] 2.4 Add `Newsletter` entity to `ECommerce.Domain/Entities/Newsletter.cs`
- [ ] 2.5 Extend `Product` entity: add `StockQuantity`, `Variations` nav, `Reviews` nav
- [ ] 2.6 Extend `CartItem` entity: add `VariationId` (nullable FK) and `Variation` nav
- [ ] 2.7 Extend `Order` entity: add `CouponCode` (nullable string) and `DiscountAmount` (decimal)
- [ ] 2.8 Update `OrderStatuses` constants: replace `PendingPayment`/`Paid` with `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`, `Failed`
- [ ] 2.9 Configure all new entities in `AppDbContext` (DbSets, indexes, constraints)
- [ ] 2.10 Add EF Core migration: `dotnet ef migrations add UpgradeV2 --project ECommerce.Infrastructure --startup-project ECommerce.API`
- [ ] 2.11 Apply migration: `dotnet ef database update --project ECommerce.Infrastructure --startup-project ECommerce.API`

## Phase 3: Reviews

- [ ] 3.1 Add `ReviewDto`, `AddReviewRequest` to `ECommerce.Application/DTOs/`
- [ ] 3.2 Add `IReviewRepository` interface and `ReviewRepository` implementation
- [ ] 3.3 Add `IReviewService` interface and `ReviewService` implementation (get reviews, add review with duplicate check)
- [ ] 3.4 Add `ReviewMappingProfile` to AutoMapper profiles
- [ ] 3.5 Add FluentValidation validator for `AddReviewRequest` (Rating 1–5, Comment max 1000 chars)
- [ ] 3.6 Register `IReviewRepository` and `IReviewService` in DI
- [ ] 3.7 Add `GET /api/Products/{id}/reviews` and `POST /api/Products/{id}/reviews` endpoints to `ProductsController`
- [ ] 3.8 Update `ProductService.GetByIdAsync` and `GetProductsAsync` to include `AverageRating` and `ReviewCount` in `ProductDto`

## Phase 4: Product Variations and Stock

- [ ] 4.1 Add `ProductVariationDto`, `UpsertVariationRequest` to DTOs
- [ ] 4.2 Add `IProductVariationRepository` interface and implementation
- [ ] 4.3 Update `ProductUpsertRequest` to include optional `Variations` array
- [ ] 4.4 Update `ProductService.CreateAsync` and `UpdateAsync` to handle variations
- [ ] 4.5 Update `ProductDto` to include `Variations`, `InStock` fields
- [ ] 4.6 Update `CartService.AddAsync` to: accept optional `VariationId`, validate stock (product or variation), return HTTP 400 on insufficient stock
- [ ] 4.7 Update `AddToCartRequest` DTO to include optional `VariationId`
- [ ] 4.8 Add `PATCH /api/Admin/products/{id}/stock` endpoint to `AdminController`
- [ ] 4.9 Update `OrderService.CheckoutAsync` to decrement stock (product or variation) within the same `SaveChangesAsync` call
- [ ] 4.10 Add `GET /api/Products/suggestions?q=` endpoint to `ProductsController`
- [ ] 4.11 Add `GET /api/Products/{id}/related?limit=4` endpoint to `ProductsController`
- [ ] 4.12 Update `ProductQuery` DTO to include `MinPrice`, `MaxPrice`, `MinRating` filter params
- [ ] 4.13 Update `ProductRepository` query to apply new filter params

## Phase 5: Discounts and Coupons

- [ ] 5.1 Add `DiscountDto`, `UpsertCouponRequest`, `ApplyCouponRequest`, `ApplyCouponResult` to DTOs
- [ ] 5.2 Add `IDiscountRepository` interface and `DiscountRepository` implementation
- [ ] 5.3 Add `IDiscountService` interface and `DiscountService` implementation (apply coupon validation, CRUD)
- [ ] 5.4 Add `DiscountMappingProfile` to AutoMapper profiles
- [ ] 5.5 Add FluentValidation validators for `UpsertCouponRequest` and `ApplyCouponRequest`
- [ ] 5.6 Register `IDiscountRepository` and `IDiscountService` in DI
- [ ] 5.7 Add `POST /api/Cart/apply-coupon` endpoint to `CartController`
- [ ] 5.8 Update `CartController.Get` to return `CartResponseDto` (items + subtotal + discount + total)
- [ ] 5.9 Update `OrderService.CheckoutAsync` to accept optional `couponCode`, apply discount, increment `UsedCount`
- [ ] 5.10 Add Admin coupon CRUD endpoints to `AdminController`: `GET`, `POST`, `PUT /{id}`, `DELETE /{id}` under `/api/Admin/coupons`

## Phase 6: Cart Sync and Order Workflow

- [ ] 6.1 Add `GuestCartItem`, `CartSyncRequest`, `CartResponseDto` to `CartDtos.cs`
- [ ] 6.2 Add `SyncGuestCartAsync` method to `ICartService` and implement in `CartService`
- [ ] 6.3 Add `POST /api/Cart/sync` endpoint to `CartController`
- [ ] 6.4 Update `IOrderService` and `OrderService` to add `AdvanceStatusAsync` with transition validation
- [ ] 6.5 Add `PATCH /api/Admin/orders/{id}/status` endpoint to `AdminController`
- [ ] 6.6 Update `IOrderService` and `OrderService` to add `GetMyOrdersPagedAsync` returning `PagedResult<OrderDto>`
- [ ] 6.7 Update `GET /api/Orders/my` to accept `page` and `pageSize` query params

## Phase 7: Admin Dashboard and Newsletter

- [ ] 7.1 Add `DashboardDto`, `RevenueByDayDto`, `OrdersByStatusDto`, `TopProductDto` to `AdminDtos.cs`
- [ ] 7.2 Extend `IAdminService` and `AdminService` with `GetDashboardAsync` (revenue, orders, users, products, charts data)
- [ ] 7.3 Add `GET /api/Admin/dashboard` endpoint to `AdminController`
- [ ] 7.4 Add `Newsletter` entity, `INewsletterRepository`, `NewsletterRepository`, `INewsletterService`, `NewsletterService`
- [ ] 7.5 Add FluentValidation validator for newsletter subscribe request
- [ ] 7.6 Register newsletter services in DI
- [ ] 7.7 Add `NewsletterController` with `POST /api/Newsletter/subscribe`

## Phase 8: Frontend — Foundation

- [ ] 8.1 Install `lucide-react` and `recharts` packages: `npm install lucide-react recharts`
- [ ] 8.2 Replace all emoji/unicode icons in `HeroSection.jsx` with Lucide icons (`Headphones`, `Footprints`, `Smartphone`, `Laptop`, `Sparkles`)
- [ ] 8.3 Replace cart/user/menu icons in `Navbar.jsx` with Lucide `ShoppingCart`, `User`, `Menu`, `X`
- [ ] 8.4 Update `ProductCard.jsx`: replace star emoji with `StarRating` component using Lucide `Star`/`StarHalf`, use real `averageRating`/`reviewCount` from API data, add "Out of stock" badge when `inStock === false`
- [ ] 8.5 Update `api/client.js` to unwrap `ApiResponse<T>` — intercept responses and return `response.data.data` so existing call sites don't break
- [ ] 8.6 Create `components/EmptyState.jsx` — accepts `icon`, `message`, `ctaLabel`, `ctaTo` props
- [ ] 8.7 Create `components/StarRating.jsx` — read-only, accepts `rating` (decimal), renders filled/half/empty Lucide stars
- [ ] 8.8 Create `components/KpiCard.jsx` — icon, label, value, optional trend indicator

## Phase 9: Frontend — Admin Module

- [ ] 9.1 Create `components/AdminLayout.jsx` — sidebar with links to Dashboard, Products, Orders, Users, Coupons; renders `<Outlet />`
- [ ] 9.2 Update `App.jsx` — add nested routes under `/admin` using `AdminLayout`, protect all with `ProtectedRoute adminOnly`
- [ ] 9.3 Create `pages/admin/Dashboard.jsx` — KPI cards + Recharts area chart (revenue 30d) + bar chart (orders by status) + top products table
- [ ] 9.4 Create `pages/admin/AdminProducts.jsx` — paginated product list, create/edit modal, delete, stock update, bulk create
- [ ] 9.5 Create `pages/admin/AdminOrders.jsx` — paginated order list, status filter, status advancement dropdown
- [ ] 9.6 Create `pages/admin/AdminUsers.jsx` — paginated user list with role, registration date, order count
- [ ] 9.7 Create `pages/admin/AdminCoupons.jsx` — full CRUD for coupons (list, create form, edit, delete)

## Phase 10: Frontend — Shop and Product Pages

- [ ] 10.1 Create `components/SearchBar.jsx` — debounced input (300ms), calls `/api/Products/suggestions`, renders dropdown of up to 5 results
- [ ] 10.2 Update `Shop.jsx` — add `SearchBar`, price range inputs (minPrice/maxPrice), rating filter buttons, active filter count badge, `EmptyState` when no results
- [ ] 10.3 Update `ProductPage.jsx` — larger image (min-height 400px), `StarRating` + review count, variation selectors (size buttons + color swatches), disabled state for out-of-stock variations, "Related Products" section (4 cards), reviews section with `ReviewForm` and `EmptyState`
- [ ] 10.4 Create `components/ReviewForm.jsx` — star picker (1–5 click), comment textarea, submit button with loading state; only shown to authenticated users who haven't reviewed
- [ ] 10.5 Update `ProductCard.jsx` — zoom image on hover (CSS `scale(1.08)` transition 300ms), discount badge from real API data, Lucide `ShoppingCart` on add button

## Phase 11: Frontend — Cart, Orders, Footer

- [ ] 11.1 Update `Cart.jsx` — coupon input + "Apply" button calling `/api/Cart/apply-coupon`, display discount amount and updated total, `EmptyState` when cart is empty
- [ ] 11.2 Update `AuthContext.jsx` — after login, read `localStorage['guest_cart']`, call `POST /api/Cart/sync` if non-empty, clear `guest_cart` on success
- [ ] 11.3 Create `components/StatusStepper.jsx` — horizontal stepper for `Pending → Processing → Shipped → Delivered`; highlights current step; shows Cancelled/Failed in red
- [ ] 11.4 Update `Orders.jsx` — order cards with expandable items list, `StatusStepper` per order, `EmptyState` when no orders, pagination
- [ ] 11.5 Update `Layout.jsx` (or create `Footer.jsx`) — grid footer with brand column, nav links column, newsletter signup column calling `POST /api/Newsletter/subscribe`
- [ ] 11.6 Add scroll-to-top on route change in `App.jsx` or a `ScrollToTop` component

## Phase 12: Tests

- [ ] 12.1 Write xUnit unit tests for `OrderService.AdvanceStatusAsync` — all valid and invalid transition combinations
- [ ] 12.2 Write xUnit unit tests for `CartService.SyncGuestCartAsync` — merge logic (existing item quantity add, new item insert)
- [ ] 12.3 Write xUnit unit tests for `DiscountService` — expired coupon, usage limit, min order amount, valid coupon
- [ ] 12.4 Write xUnit unit tests for `ReviewService` — duplicate review rejection, average rating calculation
- [ ] 12.5 Write AutoMapper configuration smoke test: `mapper.ConfigurationProvider.AssertConfigurationIsValid()`
- [ ] 12.6 Write property-based test (FsCheck): Property 1 — order status transition validity across all status pairs
- [ ] 12.7 Write property-based test (FsCheck): Property 2 — stock decrement equals ordered quantity for any cart
- [ ] 12.8 Write property-based test (FsCheck): Property 3 — coupon UsedCount monotonicity up to MaxUses
- [ ] 12.9 Write property-based test (FsCheck): Property 4 — cart sync idempotency (sync twice = sync once)
- [ ] 12.10 Write property-based test (FsCheck): Property 5 — review uniqueness per user-product pair
- [ ] 12.11 Write Vitest tests for `StatusStepper` — correct active step for each status value
- [ ] 12.12 Write Vitest tests for `EmptyState` — renders icon, message, CTA link

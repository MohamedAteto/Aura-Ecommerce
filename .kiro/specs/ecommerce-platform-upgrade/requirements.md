# Requirements Document

## Introduction

This document defines the requirements for upgrading the existing AURA E-Commerce platform — an ASP.NET Core Web API + React (Vite) application. The upgrade covers two major areas:

1. **Backend** — Hardening the existing clean architecture with a unified API response envelope, AutoMapper, extended domain models (ratings/reviews, product variations, stock, discounts), a full order-status workflow, cart-login sync, and an enriched Admin module with dashboard analytics.

2. **Frontend** — Elevating the existing premium dark UI to a Dribbble-level experience: replacing emoji icons with Lucide Icons, adding a search-suggestions bar, price-range and rating filters, a full Admin dashboard with analytics charts, empty-state components, and polished micro-interactions throughout.

The project already has: clean architecture layers, Unit of Work, FluentValidation, JWT role-based auth, pagination, global error middleware, persistent DB cart, Framer Motion, and a dark gradient design system. These are preserved and extended.

---

## Glossary

- **API**: The ASP.NET Core Web API backend running on `http://localhost:5255`.
- **Client**: The React + Vite frontend running on `http://localhost:5173`.
- **ApiResponse**: The unified JSON envelope `{ success: bool, data: T, message: string }` returned by every API endpoint.
- **Product**: A sellable item with name, description, price, images, category, stock quantity, and optional variations.
- **ProductVariation**: A size/color combination attached to a Product, each with its own stock quantity and optional price delta.
- **Review**: A user-submitted star rating (1–5) and optional text comment for a Product.
- **Discount**: A coupon code or automatic rule that reduces the order total by a fixed amount or percentage.
- **Order**: A confirmed purchase with a status that progresses through the defined workflow.
- **OrderStatus**: One of `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`, `Failed`.
- **Cart**: A persistent, database-backed collection of CartItems belonging to a User.
- **CartSync**: The process of merging a guest (localStorage) cart into the authenticated user's database cart upon login.
- **Admin**: A user with the `Admin` role who has access to the `/admin` module.
- **Dashboard**: The Admin analytics view showing KPI cards and charts.
- **Skeleton**: A CSS/animated placeholder shown while data is loading.
- **EmptyState**: A component shown when a list has zero items, containing an icon and a CTA.
- **LucideIcon**: An SVG icon from the `lucide-react` package used in place of emoji characters.
- **AutoMapper**: The `AutoMapper` NuGet library used to map between Domain entities and DTOs.
- **UnitOfWork**: The existing `IUnitOfWork` / `UnitOfWork` pattern that wraps `SaveChangesAsync`.
- **FluentValidation**: The existing validation library used for all request DTOs.
- **JWT**: JSON Web Token used for authentication; carries `sub` (userId), `role`, `email` claims.

---

## Requirements

### Requirement 1: Unified API Response Envelope

**User Story:** As a frontend developer, I want every API endpoint to return a consistent `{ success, data, message }` envelope, so that I can handle responses uniformly without per-endpoint parsing logic.

#### Acceptance Criteria

1. THE API SHALL wrap every successful response body in `{ "success": true, "data": <payload>, "message": "" }`.
2. THE API SHALL wrap every error response body in `{ "success": false, "data": null, "message": "<human-readable error>" }`.
3. WHEN a validation error occurs, THE API SHALL return HTTP 400 with `{ "success": false, "data": { "errors": { "<field>": ["<message>"] } }, "message": "Validation failed" }`.
4. THE ExceptionMiddleware SHALL produce ApiResponse-shaped error bodies for all unhandled exceptions.
5. THE API SHALL preserve existing HTTP status codes (200, 201, 400, 401, 403, 404, 409, 500) alongside the envelope.

---

### Requirement 2: AutoMapper Integration

**User Story:** As a backend developer, I want AutoMapper to handle all entity-to-DTO mappings, so that mapping logic is centralised, testable, and not duplicated across services.

#### Acceptance Criteria

1. THE Application_Layer SHALL define AutoMapper `Profile` classes that map every Domain entity to its corresponding DTO.
2. WHEN a service method returns a DTO, THE Service SHALL use AutoMapper's `IMapper.Map<TDestination>` instead of manual property assignment.
3. THE AutoMapper_Configuration SHALL be registered in the DI container via `AddAutoMapper` in `DependencyInjection.cs`.
4. IF a mapping is missing for a used type pair, THEN THE Application_Layer SHALL throw a configuration exception at startup, not at runtime.

---

### Requirement 3: Product Ratings and Reviews

**User Story:** As a shopper, I want to read and submit star ratings and text reviews for products, so that I can make informed purchase decisions and share my experience.

#### Acceptance Criteria

1. THE Review_System SHALL store reviews with fields: `Id`, `ProductId`, `UserId`, `Rating` (integer 1–5), `Comment` (optional, max 1000 chars), `CreatedAtUtc`.
2. WHEN a user submits a review, THE Review_API SHALL accept `{ productId, rating, comment }` via `POST /api/Products/{id}/reviews`.
3. IF a user has already submitted a review for the same product, THEN THE Review_API SHALL return HTTP 409 with message "You have already reviewed this product."
4. THE Product_API SHALL include `averageRating` (decimal, 1 decimal place) and `reviewCount` (integer) in every `ProductDto` response.
5. WHEN fetching a product detail, THE Product_API SHALL return the 10 most recent reviews ordered by `CreatedAtUtc` descending via `GET /api/Products/{id}/reviews`.
6. THE Client SHALL display star ratings (filled/half/empty) on ProductCard and ProductPage using LucideIcons (`Star`, `StarHalf`).
7. THE Client SHALL render a review submission form on ProductPage, visible only to authenticated users who have not yet reviewed the product.
8. IF a user is not authenticated and attempts to submit a review, THEN THE Client SHALL redirect the user to the login page.

---

### Requirement 4: Product Variations (Size / Color)

**User Story:** As a shopper, I want to select a specific size and color variant of a product before adding it to my cart, so that I receive exactly the item I want.

#### Acceptance Criteria

1. THE ProductVariation_System SHALL store variations with fields: `Id`, `ProductId`, `Size` (optional string, max 50 chars), `Color` (optional string, max 50 chars), `StockQuantity` (integer ≥ 0), `PriceDelta` (decimal, default 0).
2. THE Product_API SHALL include a `variations` array in `ProductDto` when variations exist.
3. WHEN an admin creates or updates a product, THE Admin_API SHALL accept an optional `variations` array in the request body.
4. WHEN a shopper adds a product with variations to the cart, THE Cart_API SHALL require a `variationId` field in the request body.
5. IF a `variationId` is provided and the variation's `StockQuantity` is 0, THEN THE Cart_API SHALL return HTTP 400 with message "This variant is out of stock."
6. THE Client ProductPage SHALL render variation selectors (size buttons, color swatches) when the product has variations.
7. WHEN a variation is selected, THE Client SHALL update the displayed price to reflect `basePrice + priceDelta`.

---

### Requirement 5: Stock Management

**User Story:** As an admin, I want to track and manage product stock levels, so that customers cannot purchase items that are unavailable.

#### Acceptance Criteria

1. THE Product_Entity SHALL include a `StockQuantity` field (integer ≥ 0, default 0).
2. WHEN a product has no variations, THE Cart_API SHALL validate that the requested quantity does not exceed `Product.StockQuantity`.
3. IF the requested quantity exceeds available stock, THEN THE Cart_API SHALL return HTTP 400 with message "Insufficient stock. Only {available} unit(s) available."
4. WHEN an order is placed via checkout, THE Order_Service SHALL decrement `StockQuantity` (or `ProductVariation.StockQuantity`) for each ordered item within the same database transaction.
5. IF stock becomes 0 after checkout, THEN THE Product_API SHALL include `"inStock": false` in the `ProductDto`.
6. THE Admin_API SHALL allow updating `StockQuantity` for a product or variation via `PATCH /api/Admin/products/{id}/stock`.
7. THE Client ProductCard SHALL display an "Out of stock" badge when `inStock` is false and disable the "Add to cart" button.

---

### Requirement 6: Discount and Coupon System

**User Story:** As a shopper, I want to apply a discount coupon at checkout, so that I can receive a price reduction on my order.

#### Acceptance Criteria

1. THE Discount_System SHALL store coupons with fields: `Id`, `Code` (unique, case-insensitive, max 50 chars), `Type` (`Percentage` | `FixedAmount`), `Value` (decimal > 0), `MinOrderAmount` (decimal, default 0), `MaxUses` (integer, null = unlimited), `UsedCount` (integer), `ExpiresAtUtc` (nullable), `IsActive` (bool).
2. WHEN a shopper applies a coupon code, THE Cart_API SHALL validate the code via `POST /api/Cart/apply-coupon` with body `{ "code": "..." }`.
3. IF the coupon code does not exist or `IsActive` is false, THEN THE Cart_API SHALL return HTTP 400 with message "Invalid or expired coupon code."
4. IF the coupon has exceeded `MaxUses`, THEN THE Cart_API SHALL return HTTP 400 with message "This coupon has reached its usage limit."
5. IF the cart subtotal is below `MinOrderAmount`, THEN THE Cart_API SHALL return HTTP 400 with message "Minimum order amount of {amount} required for this coupon."
6. WHEN a valid coupon is applied, THE Cart_API SHALL return the updated cart total with `discountAmount` and `couponCode` fields.
7. WHEN an order is placed with an applied coupon, THE Order_Service SHALL increment `Discount.UsedCount` and store `couponCode` and `discountAmount` on the Order.
8. THE Admin_API SHALL provide CRUD endpoints for coupons at `/api/Admin/coupons`.
9. THE Client Cart page SHALL render a coupon input field with an "Apply" button and display the discount amount when a coupon is active.

---

### Requirement 7: Order Status Workflow

**User Story:** As a shopper, I want to track my order through a clear status progression, so that I always know where my order is.

#### Acceptance Criteria

1. THE Order_Entity SHALL support statuses: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`, `Failed`.
2. WHEN a checkout is completed successfully, THE Order_Service SHALL set the initial status to `Pending`.
3. THE Admin_API SHALL allow advancing an order's status via `PATCH /api/Admin/orders/{id}/status` with body `{ "status": "..." }`.
4. THE Order_Service SHALL enforce the following valid transitions only:
   - `Pending` → `Processing` or `Cancelled`
   - `Processing` → `Shipped` or `Cancelled`
   - `Shipped` → `Delivered`
5. IF an admin attempts an invalid status transition, THEN THE Order_Service SHALL return HTTP 400 with message "Invalid status transition from {current} to {requested}."
6. THE Client Orders page SHALL display a visual status stepper (Pending → Processing → Shipped → Delivered) for each order.
7. WHEN an order is `Cancelled` or `Failed`, THE Client SHALL display the status in a distinct red/error colour.

---

### Requirement 8: Cart Login Sync

**User Story:** As a shopper, I want my guest cart items to be merged into my account cart when I log in, so that I do not lose items I added before signing in.

#### Acceptance Criteria

1. THE Client SHALL store guest cart items in `localStorage` under the key `guest_cart` as a JSON array of `{ productId, variationId?, quantity }`.
2. WHEN a user successfully logs in, THE Client SHALL read `guest_cart` from `localStorage` and call `POST /api/Cart/sync` with the guest items array.
3. THE Cart_API SHALL merge guest items into the user's database cart: if a matching `productId`+`variationId` already exists, THE Cart_API SHALL add the quantities; otherwise THE Cart_API SHALL insert a new CartItem.
4. AFTER a successful sync, THE Client SHALL clear `guest_cart` from `localStorage`.
5. IF `guest_cart` is empty or absent, THE Client SHALL skip the sync call.
6. THE Cart_API SHALL return the merged cart contents after sync.

---

### Requirement 9: Admin Dashboard Analytics

**User Story:** As an admin, I want a dashboard with KPI cards and charts, so that I can monitor business performance at a glance.

#### Acceptance Criteria

1. THE Admin_API SHALL provide `GET /api/Admin/dashboard` returning: `totalRevenue`, `totalOrders`, `totalUsers`, `totalProducts`, `revenueByDay` (last 30 days, array of `{ date, revenue }`), `ordersByStatus` (array of `{ status, count }`), `topProducts` (top 5 by revenue, array of `{ productId, name, revenue }`).
2. THE Client Admin Dashboard SHALL display KPI cards for: Total Revenue, Total Orders, Total Users, Total Products.
3. THE Client Admin Dashboard SHALL render a line/area chart for "Revenue last 30 days" using a charting library (Recharts or Chart.js).
4. THE Client Admin Dashboard SHALL render a bar or donut chart for "Orders by status".
5. THE Client Admin Dashboard SHALL render a "Top 5 Products by Revenue" table or bar chart.
6. WHEN the dashboard data is loading, THE Client SHALL display Skeleton placeholders for each KPI card and chart.
7. THE Admin module SHALL be accessible only to users with the `Admin` role; all other users SHALL be redirected to the home page.

---

### Requirement 10: Separate Admin Module Routing

**User Story:** As an admin, I want a dedicated `/admin` section with its own navigation and sub-pages, so that admin tasks are clearly separated from the shopper experience.

#### Acceptance Criteria

1. THE Client SHALL define nested routes under `/admin`: `/admin` (dashboard), `/admin/products`, `/admin/orders`, `/admin/users`, `/admin/coupons`.
2. THE Admin_Layout SHALL render a persistent sidebar with links to each admin sub-page, separate from the main shopper Navbar.
3. WHEN a non-admin user navigates to any `/admin/*` route, THE ProtectedRoute SHALL redirect the user to `/`.
4. THE Admin_Products page SHALL support: list with pagination, create, edit (inline or modal), delete, stock update, and bulk-create.
5. THE Admin_Orders page SHALL support: list with pagination, status filter, and status advancement via the workflow defined in Requirement 7.
6. THE Admin_Users page SHALL display a paginated list of users with their role, registration date, and order count.
7. THE Admin_Coupons page SHALL support full CRUD for discount coupons as defined in Requirement 6.

---

### Requirement 11: Enhanced Search and Filtering

**User Story:** As a shopper, I want a search bar with live suggestions and advanced filters (price range, rating, category), so that I can quickly find the products I want.

#### Acceptance Criteria

1. THE Search_Bar SHALL display a dropdown of up to 5 product name suggestions as the user types, with a debounce of 300 ms.
2. THE Product_API SHALL provide `GET /api/Products/suggestions?q={term}` returning up to 5 matching product names and IDs.
3. THE Shop_Page SHALL include a price range filter with a minimum and maximum price input (or dual-handle slider).
4. THE Product_API SHALL accept `minPrice` and `maxPrice` query parameters and filter results accordingly.
5. THE Shop_Page SHALL include a rating filter (e.g., "4★ & up", "3★ & up") that filters products by `averageRating`.
6. THE Product_API SHALL accept a `minRating` query parameter (decimal 1–5) and filter results accordingly.
7. WHEN no products match the active filters, THE Shop_Page SHALL display an EmptyState component with a "Clear filters" CTA button.
8. THE Shop_Page SHALL display the active filter count as a badge on the "Filters" label.

---

### Requirement 12: Icon Library Migration

**User Story:** As a frontend developer, I want all emoji characters replaced with Lucide Icons, so that the UI looks professional and icons scale correctly on all screen densities.

#### Acceptance Criteria

1. THE Client SHALL install `lucide-react` as a dependency.
2. THE HeroSection floating cards SHALL replace emoji characters with corresponding LucideIcons (e.g., `Headphones`, `Footprints`, `Smartphone`, `Laptop`).
3. THE Navbar SHALL use LucideIcons for the cart icon (`ShoppingCart`), user icon (`User`), and menu burger (`Menu` / `X`).
4. THE ProductCard "Add to cart" button SHALL use the `ShoppingCart` LucideIcon.
5. THE ProductCard star rating SHALL use `Star` and `StarHalf` LucideIcons.
6. THE Admin pages SHALL use LucideIcons for action buttons (edit: `Pencil`, delete: `Trash2`, add: `Plus`).
7. THE EmptyState component SHALL use a contextually appropriate LucideIcon (e.g., `PackageSearch` for empty product list, `ShoppingBag` for empty cart).
8. THE Ticker items in HeroSection SHALL replace the `✦` character with the `Sparkles` LucideIcon.

---

### Requirement 13: Premium UI Enhancements

**User Story:** As a shopper, I want a visually polished, responsive interface with smooth animations and clear feedback, so that shopping feels effortless and enjoyable.

#### Acceptance Criteria

1. THE Client SHALL use a full-width responsive layout with a maximum content width of 1280px.
2. THE Navbar SHALL become sticky and display a frosted-glass background with a subtle border when the user scrolls past 12px.
3. THE ProductCard SHALL animate the product image with a zoom effect (`scale(1.08)`) on hover, with a 300 ms ease transition.
4. THE ProductCard SHALL display a discount badge (e.g., "−20%") when a product has an active discount, using real discount data from the API.
5. THE Shop_Page loading state SHALL use the existing `SkeletonGrid` component; THE SkeletonGrid SHALL animate with a shimmer effect.
6. THE Footer SHALL include a grid layout with: brand column, navigation links column, and a newsletter signup column with an email input and submit button.
7. THE Footer newsletter form SHALL call `POST /api/Newsletter/subscribe` with `{ email }` and display a success or error message.
8. WHEN a button action is in progress, THE Client SHALL display a loading spinner inside the button and disable it to prevent double-submission.
9. THE Client SHALL display page-level error states with an icon, a human-readable message, and a "Try again" button.
10. THE Client SHALL support smooth scroll-to-top on route change.

---

### Requirement 14: Product Detail Page Enhancements

**User Story:** As a shopper, I want a rich product detail page with images, variations, reviews, and related products, so that I have all the information I need before purchasing.

#### Acceptance Criteria

1. THE ProductPage SHALL display the product image in a larger format (min-height 400px on desktop) with a zoom-on-hover effect.
2. THE ProductPage SHALL display `averageRating` as star icons and `reviewCount` below the product title.
3. THE ProductPage SHALL render variation selectors (size buttons, color swatches) when `variations` are present in the product data.
4. WHEN a variation is out of stock, THE Client SHALL display the variation selector as disabled with a strikethrough style.
5. THE ProductPage SHALL display a "Related Products" section showing up to 4 products from the same category.
6. THE Product_API SHALL provide `GET /api/Products/{id}/related?limit=4` returning products from the same category, excluding the current product.
7. THE ProductPage SHALL render the reviews section with: average rating summary, star distribution bar chart, and a list of individual reviews.
8. THE ProductPage SHALL display an EmptyState in the reviews section when no reviews exist, with a "Be the first to review" CTA.

---

### Requirement 15: Orders Page Enhancements

**User Story:** As a shopper, I want my orders page to show a clear status timeline and order details, so that I can track my purchases easily.

#### Acceptance Criteria

1. THE Orders_Page SHALL display each order in a card with: order ID, date, total, status badge, and an expandable items list.
2. THE Orders_Page SHALL render a horizontal status stepper (Pending → Processing → Shipped → Delivered) for each order, highlighting the current step.
3. WHEN the orders list is empty, THE Orders_Page SHALL display an EmptyState component with a "Start shopping" CTA linking to `/shop`.
4. THE Orders_Page SHALL support pagination if the user has more than 10 orders.
5. THE Order_API SHALL accept `page` and `pageSize` query parameters for `GET /api/Orders/my` and return a `PagedResult<OrderDto>`.

---

### Requirement 16: Newsletter Subscription

**User Story:** As a visitor, I want to subscribe to the newsletter from the footer, so that I receive updates about new products and promotions.

#### Acceptance Criteria

1. THE Newsletter_System SHALL store subscriptions with fields: `Id`, `Email` (unique, valid format), `SubscribedAtUtc`.
2. THE Newsletter_API SHALL accept `POST /api/Newsletter/subscribe` with body `{ "email": "..." }`.
3. IF the email is already subscribed, THEN THE Newsletter_API SHALL return HTTP 200 with message "You are already subscribed."
4. IF the email format is invalid, THEN THE Newsletter_API SHALL return HTTP 400 with message "Please enter a valid email address."
5. WHEN a new subscription is created, THE Newsletter_API SHALL return HTTP 201 with message "Thank you for subscribing!"
6. THE Footer newsletter form SHALL display inline success/error feedback without a page reload.

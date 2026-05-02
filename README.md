# AURA — Full-stack e-commerce (demo)

Backend: **ASP.NET Core 8** Web API, **EF Core** + **SQL Server**, **JWT** auth, and a layered **Controllers → Services → Repositories** structure.

Frontend: **React (Vite)** with **Axios**, **React Router**, **Framer Motion** for motion and page transitions, and a responsive, dark premium UI.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org) (for the React client)
- [SQL Server LocalDB](https://learn.microsoft.com/sql/database-engine/configure-windows/sql-server-express-localdb) (or change the connection string to your SQL Server instance in `src/ECommerce.API/appsettings.json`)

## Run the API

```powershell
cd c:\Cursor_Projects\src\ECommerce.API
dotnet run
```

- HTTP: `http://localhost:5255`
- Swagger: `http://localhost:5255/swagger`

On first run, the app applies migrations, seeds sample categories and products, and creates an **admin** user:

- **Email:** `admin@shop.com`
- **Password:** `Admin123!`

## Run the React app

In another terminal:

```powershell
cd c:\Cursor_Projects\client
npm install
npm run dev
```

Open `http://localhost:5173`. The dev server uses `VITE_API_URL` from `client/.env.development` (defaults to `http://localhost:5255`).

## Project layout

- `src/ECommerce.Domain` — entities and role names
- `src/ECommerce.Application` — DTOs, service interfaces, validators, use-case services
- `src/ECommerce.Infrastructure` — EF Core `AppDbContext`, repositories, JWT + password helpers, seeding
- `src/ECommerce.API` — controllers, global exception + FluentValidation, JWT auth, CORS for the Vite port
- `client/` — React SPA (shop, cart, checkout, orders, admin dashboard)

## Features (summary)

- Register / login with JWT, **Admin** and **User** roles
- Products with **pagination**, **category** filter, **search**, **price sort**
- **Persistent cart** per user (server-side)
- **Checkout** (order from cart) and **order history**
- **Fake payment** (success or failure) on pending orders
- **Admin:** product CRUD, **bulk create** (1–100 products), **category** CRUD (`GET/POST/PUT/DELETE /api/Categories`), **image upload** (`POST /api/Media/upload` → files in `wwwroot/uploads`), all orders, stats
- **Global** API error handler; **FluentValidation** on request models
- Static files: uploaded images are served from `/uploads/...` on the API host (use full URL returned by upload, or prefix with your API URL on the client)

## Connection string

Edit `DefaultConnection` in `src/ECommerce.API/appsettings.json` to point to your database. Keep `TrustServerCertificate=True` for local development if needed.

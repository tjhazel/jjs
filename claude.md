# Project Guide: jjs (.NET 10 Aspire + React, Vite, & Mantine UI)

## Core Tech Stack & Rules
- Runtime: .NET 10.0 (LTS) / C# 14
- Database & ORM: MS SQL Server / **Dapper** (no EF Core — raw SQL + Dapper everywhere)
- Frontend: React 19 / TypeScript / Vite / Mantine UI 9 (Strict types, no implicit `any`)
- C# 14 Idioms: Use `field`-backed properties; favor extension members; use primary constructors.
- Validation: Zod 4 (frontend forms); Dapper parameter binding (backend)
- Data Fetching: SWR 2 + Axios (frontend); Dapper QueryAsync (backend)

## Database & Asset Boundaries (Token Savings)
*Do not read raw database logs, large seed data, or media folders.*
- Database: SQL Server. Configuration is handled natively by .NET Aspire.
- SQL Assets: Schema definition files in `Database/` (SSDT project). Migration script at `Database/Scripts/Migrate.sql`.
- Media Storage: Static images/binaries in `JJS.Api/Albums/`. **Avoid scanning this directory.**

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│  .NET Aspire AppHost (JJS.AppHost)                  │
│    orchestrates:                                     │
│      jjs-api  (ASP.NET Core REST API :5001)         │
│      jjs-web-ui  (Vite dev server :5173)            │
└─────────────────────────────────────────────────────┘
         │                        │
    JJS.Api (Dapper+SQL)     jjs-web (React SPA)
         │
    SQL Server (local/Azure)
```

**Deployment target:** Windows Server / IIS via FTP (GitHub Actions). UI served from `/ui/`, API from root. No Docker in production.

---

## Solution / Project Map

| Project | Path | Role |
|---|---|---|
| `JJS.Api` | `JJS.Api/` | REST API — controllers, services, repositories, middleware |
| `JJS.AppHost` | `Aspire/JJS.AppHost/` | Aspire orchestration host; registers jjs-api + jjs-web-ui |
| `JJS.ServiceDefaults` | `Aspire/JJS.ServiceDefaults/` | Shared OpenTelemetry, health checks, resilience, service discovery |
| `Database` | `Database/` | SSDT SQL Server project — all tables, views, functions |
| `jjs-web` | `jjs-web/` | Vite React SPA |

**No test projects exist.**

---

## Business Domains

Three content domains, all role-gated at the write path:

| Domain | Backend | Frontend pages |
|---|---|---|
| **Posts / Articles** | `PostController`, `PostService`, `PostRepository` | `/article`, `/article/post/:id`, `/admin/articles`, `/admin/article/:id` |
| **Recipes** | `RecipeController`, `RecipeService`, `RecipeRepository` | `/recipe`, `/recipe/:id`, `/admin/recipes`, `/admin/recipe/:id` |
| **Photo Albums** | `AlbumController`, `AlbumService`, `ImageController` | `/album` |
| **Auth** | `AuthController`, `UserValidationMiddleware` | `/login`, `/unauthorized` |
| **Categories** | `CategoryController`, `CategoryService` | Shared across posts & recipes |
| **Attachments** | `AttachmentController`, `AttachmentService` | Used by recipes (pictures) and posts |

---

## API Endpoints

All backend routes are prefixed `/api/`.

| Controller | Route | Auth | Purpose |
|---|---|---|---|
| `AuthController` | `GET /api/auth` | `[Authorize]` | Returns current user from JWT claims |
| `PostController` | `GET /api/post` | Public | All published posts |
| `PostController` | `POST /api/post` | Admin | Save (create/update) post |
| `RecipeController` | `GET /api/recipe` | Public | All recipes |
| `RecipeController` | `GET /api/recipe/{id}` | Public | Single recipe with ingredients & instructions |
| `CategoryController` | `GET /api/category` | Public | Categories filtered by `categoryTypeId` |
| `AlbumController` | `GET /api/album` | Public | Folder/file tree of album images |
| `ImageController` | `GET /api/image/{path}` | Public | Serves image file bytes with proper MIME type |
| `AttachmentController` | `GET /api/attachment/{id}` | Public | Attachment metadata |

---

## Data Model (SQL Server Tables)

**Users:** `UserId`, `Email`, `DisplayName`, `Role`, `LastActivityDate`, `IsDisabled`  
**Posts:** `PostId`, `Title`, `PreviewText`, `Body` (nvarchar/Markdown), `ReleaseDate`, `ExpireDate`, `CommentsEnabled`, `Approved`, `ViewCount`  
**Recipes:** `RecipeId`, `Name`, `Description`, `RecipeSource`, `Course`, `DishType`, `Calories`, `Fat`, `NumberServed`, `PrepTime`, `CookTime`, `PictureFk`, `ViewCount`  
**RecipeInstructions:** `InstructionId`, `RecipeId`, `StepNumber`, `Instruction` (Markdown)  
**Ingredients / Ingredients_xref / UnitOfMeasure** — ingredient master + recipe-ingredient xref  
**Categories / CategoryTypes** — shared taxonomy for posts and recipes  
**PostCategories / RecipeCategory_xref** — many-to-many join tables  
**Attachments:** `AttachmentId`, `FileType`, `Data` (varbinary), `Content`  
**PostAttachments / Comments** — post metadata  

**Views:**  
- `vw_cust_PostCategorySummary` — posts with concatenated category lists  
- `vw_cust_CategorySummary` — categories with post/comment counts  
- `vw_cust_IngredientsXrefSummary` — recipe-ingredient relationships  

**SQL Functions:** `ConcatCategories`, `SplitList`, `ConvertHtmlToMarkdown`

---

## Authentication & Authorization

**Flow:**
1. User clicks "Sign in with Google" on `/login` (`@react-oauth/google`)
2. Google returns a JWT credential → stored in `sessionStorage` (`jjs_id_token`, `jjs_user`)
3. All API calls include `Authorization: Bearer <google-jwt>` via Axios interceptor
4. **Backend:** `JwtBearer` middleware validates token against `https://accounts.google.com` with the Google ClientId as audience
5. `UserValidationMiddleware` runs post-auth: looks up user by email, auto-creates on first login, adds `Role` claim, returns 403 for disabled users
6. `[Authorize(Roles = "Admin")]` on write endpoints; `[Authorize]` on `/api/auth`

**Config keys:** `AppSetting:GoogleClientId`, `AppSetting:GoogleClientSecret` (use dotnet user-secrets locally)  
**Frontend env:** `VITE_PUBLIC_GOOGLE_CLIENT_ID`, `VITE_PUBLIC_API_URL`

---

## Key Design Patterns

### Repository Pattern (Dapper, partial-class SQL split)
Every entity has two files:
- `FooRepository.cs` — interface + method implementations (Dapper calls)
- `FooRepository_Sql.cs` — SQL string constants used by the repository

### Custom Attribute-Based DI
`[ServiceImplementation(Lifetime = ServiceLifetime.Scoped)]` on classes → auto-registered on startup. No manual `services.AddScoped<>()` calls needed.

### Service Layer
`Services/` sits above repositories; holds business logic, caching calls, composition of multiple repos.

### In-Memory Cache
`MemoryCacheService` (20-min sliding expiration) wraps all hot reads. Cache keys are feature-scoped strings (e.g., `user/{email}`).

### MERGE for Upserts
SQL Server `MERGE` statements used in `PostRepository` and `UserRepository` instead of separate INSERT/UPDATE logic.

### Frontend Context / Provider Stack
```
JJSAuthProvider (Google OAuth + session token)
  └── ApiContextProvider (Axios HTTP methods with auto-token injection)
        └── RootContextProvider (app-wide notifications)
              └── RouterProvider (React Router v8)
```

### Protected Routes
`<ProtectedRoute role="Admin">` wraps admin pages; redirects to `/login` or `/unauthorized` as needed.

### Path Aliases (Vite)
`@` → `src/`, `@lib` → `src/lib/`, `@api` → `src/api/`, `@components` → `src/components/`

---

## Frontend Structure

```
jjs-web/src/
├── api/          # Fetchers, models, Zod schemas per domain (album, post, recipe, user)
├── components/   # Shared UI components (layout, article, recipe, ui primitives)
├── lib/          # auth context, httpClient (Axios), SWR helpers, storage utils
└── pages/        # Route-level page components
    ├── article/, recipe/, admin/   # domain pages
    └── dashboard, album, login, about, unauthorized
```

**Router:** React Router v8 (`createBrowserRouter`). Route loaders used for detail pages.  
**Forms:** `@mantine/form` + Zod schemas for article and recipe editing.  
**Data fetching:** SWR hooks for list views; route loaders for detail views.

---

## Build, Deployment & CI/CD

**Local dev:**
```bash
dotnet run --project Aspire/JJS.AppHost/JJS.AppHost.csproj   # Aspire orchestration
# OR run API and frontend separately:
# dotnet run --project JJS.Api/JJS.Api.csproj
# cd jjs-web && npm run dev
```

**CI/CD (`.github/workflows/deploy.yml`)** — triggers on push to `main`:
1. Build .NET API → `dotnet publish -c Release -r win-x86 -o ./publish-output/api`
2. Build React UI → `npm ci && npm run winhost` (Vite production build)
3. FTP deploy via `SamKirkland/FTP-Deploy-Action`:
   - Put app offline → deploy API to root (excludes `appsettings.json`) → deploy UI to `/ui/` → bring online
4. Secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` in GitHub repo secrets

**Vite build modes:** `dev`, `build`, `localiis` (local IIS), `winhost` (production FTP target)

---

## Startup Pipeline (JJS.Api)

`Program.cs` → `AppBuilder.BuildApp()`:
1. ServiceDefaults (Aspire telemetry, health checks, service discovery)
2. JWT Bearer auth (Google), CORS (localhost:3000/5173/5174, johnandjeri.com)
3. Swagger at `/api/swagger`
4. Auto-register services via `[ServiceImplementation]` attribute scan
5. Controllers with JSON options (ignore null, UTC datetime)

**HTTP pipeline order:** Swagger → CORS → Authentication → `UserValidationMiddleware` → Authorization → Static Files (Albums) → Routes → SPA fallback

---

## Common Development Commands

```bash
# Run full orchestrated stack
dotnet run --project Aspire/JJS.AppHost/JJS.AppHost.csproj

# Build & check compilation
dotnet build JJS.sln

# Frontend
cd jjs-web && npm install
cd jjs-web && npm run dev

# Configure Google OAuth secrets (local)
dotnet user-secrets set "Authentication:Google:ClientId" "your-id" --project Aspire/JJS.AppHost/JJS.AppHost.csproj
dotnet user-secrets set "Authentication:Google:ClientSecret" "your-secret" --project Aspire/JJS.AppHost/JJS.AppHost.csproj
```

---

## Important Reference Files

| File | Purpose |
|---|---|
| `JJS.sln` | Solution file |
| `Aspire/JJS.AppHost/AppHost.cs` | Service registrations |
| `Aspire/JJS.AppHost/appsettings.json` | Aspire runtime config |
| `JJS.Api/AppBuilder.cs` | All middleware & service wiring |
| `JJS.Api/Program.cs` | Entry point |
| `JJS.Api/Models/ServiceImplementationAttribute.cs` | Custom DI attribute |
| `jjs-web/src/routes.tsx` | All frontend routes |
| `jjs-web/src/lib/auth/authContext.tsx` | Auth state & Google OAuth |
| `jjs-web/src/lib/httpClient.ts` | Axios client with token injection |
| `jjs-web/package.json` | Frontend deps & build scripts |
| `jjs-web/.env` | Dev environment variables |
| `Database/Scripts/Migrate.sql` | DB migration script |
| `.github/workflows/deploy.yml` | CI/CD pipeline |
| `README.md` | Project history and setup overview |

---

## Mantine UI Reference

Mantine provides AI-friendly documentation at:
- **Compact:** `https://mantine.dev/llms.txt`
- **Full (~1.8 MB):** `https://mantine.dev/llms-full.txt`

When working on Mantine components or theming, fetch the compact URL for accurate, version-current API details rather than relying on training data.

---

## Technical Debt & Notes

- **No tests** — no unit, integration, or E2E test projects exist.
- **No background jobs** — view count increments are synchronous; no queuing or scheduled tasks.
- **FTP deployment** — fragile; relies on `app_offline.htm` pattern. No zero-downtime strategy.
- **sessionStorage for JWT** — token lost on tab close; by design (no persistent login).
- **Dapper + raw SQL** — all queries are in `*_Sql.cs` partial classes; no migrations framework (manual `Migrate.sql`).
- **Google ClientId in appsettings** — not secret, but `GoogleClientSecret` and JWT secrets must come from user-secrets/environment in production.
- **Content is Markdown** — legacy HTML content was migrated via `ConvertHtmlToMarkdown` SQL function; new content is authored as Markdown.

# Copilot Instructions & Knowledge Profile — JJS (john & jeri)

> **Digital home of John & Jeri (est. 2006)** — Modern rebuild as .NET 10 Aspire + React 19 SPA with Dapper, Mantine UI 9, and Gemini AI moderation.

---

## 1. Quick Reference

**Project Goal**: Full-stack personal blog, recipe collection, and photo album platform with AI-powered comment moderation.

**Tech Stack (2026)**:
- **.NET 10.0 LTS** / C# 14 with primary constructors, nullable reference types, ield-backed properties
- **React 19.2.6** / TypeScript 6 / Vite 8.0.12 / Mantine UI 9.3.2
- **MS SQL Server** + **Dapper 2.1.79** (strictly no EF Core — raw SQL only)
- **.NET Aspire** (Hosting 13.4.6, AppHost SDK 9.3.1) for orchestration
- **Google OAuth 2.0** + **JWT Bearer** authentication
- **Google Gemini 3.5 Flash** for AI comment moderation
- **SixLabors ImageSharp 3.1** for image processing & watermarking
- **SWR 2.4.1** + **Axios 1.18.0** for data fetching & HTTP
- **Zod 4.4.3** for form validation (frontend)

**Deployment**: Windows Server / IIS via GitHub Actions FTP deploy. API at root /, UI at /ui/.

**Status**: Healthy. Tests present (NUnit 4.6.1 + NSubstitute). No E2E or frontend tests.

---

## 2. Architecture & Solution Layout

### High-Level Diagram
.NET Aspire AppHost (Aspire/JJS.AppHost) orchestrates jjs-api (:5001) + jjs-web-ui (:5173).  
JJS.Api (Dapper+SQL) and jjs-web (React SPA) communicate via REST.  
SQL Server (local/Azure) with 17 Tables / 3 Views / SQL Functions.

### Projects & Directories
| Project | Path | Role |
|---|---|---|
| JJS.Api | JJS.Api/ | REST API: controllers, services, repositories, middleware, static albums |
| JJS.Api.Tests | JJS.Api.Tests/ | NUnit tests for Album, Comment, Moderation, Post services |
| JJS.AppHost | Aspire/JJS.AppHost/ | Aspire orchestration host; service registration & config |
| JJS.ServiceDefaults | Aspire/JJS.ServiceDefaults/ | Shared OpenTelemetry, health checks, resilience, service discovery |
| Database | Database/ | SSDT SQL Server project — all DDL (tables, views, functions) |
| jjs-web | jjs-web/ | Vite React SPA — routes, pages, components, API clients |

---

## 3. Core Design Patterns & Conventions

### 1. Attribute-Based Dependency Injection
Services scanned at startup via AppBuilder.RegisterAssemblyServices(). No manual registration needed.

### 2. Dapper Partial-Class Repository Pattern
Every entity has two files:
- **FooRepository.cs**: Interface definition, primary constructor, Dapper method implementations.
- **FooRepository_Sql.cs**: const string SQL queries, parameterized statements, MERGE upserts.

### 3. In-Memory Caching (MemoryCacheService)
- 20-minute sliding expiration; centralized through ICacheService.
- Cache keys declared in CacheKey.cs (e.g., post/all, post/public, lbum-cache, comment/bypost, 
eaction/bypost).
- Admin writes & cache refreshes explicitly invalidate keys via Clear(key) or ClearByPrefix(prefix).

### 4. Authentication & User Provisioning
1. **Frontend**: @react-oauth/google → Google ID Token stored in sessionStorage (jjs_id_token, jjs_user).
2. **Axios Interceptor**: Auto-attaches Authorization: <token> to all requests.
3. **Backend JWT Middleware**: Validates token against https://accounts.google.com with configured GoogleClientId.
4. **UserValidationMiddleware**: Skips OPTIONS, extracts claims, auto-creates users, returns 403 if blocked, mutates HttpContext.User.

### 5. Role-Based Access Control (RBAC)
- **Admin**: Full CRUD via [Authorize(Roles = "Admin")] and <ProtectedRoute requiredRoles={[ROLE_ADMIN]} />.
- **CircleOfTrust**: Access to private posts and /things/wedding.
- **Guest**: Can submit comments and react with emojis.
- **Public**: Read-only access to published content.

### 6. Gemini AI Comment Moderation (CommentModerationService)
- Every comment triggers gemini-3.5-flash:generateContent.
- Prompt returns JSON: { "IsSpam": boolean, "IsToxic": boolean, "Reason": "..." }.
- If flagged: AdminHidden = 1, ScreenedBy = "Gemini AI", ScreenResult = <reason>.
- Graceful degradation: missing API key logs warning, passes through for manual review.

### 7. Image Processing & Watermarking
- Resize to max 1920px width/height, aspect ratio preserved.
- Extract EXIF: XPTitle / ImageDescription for titles, XPComment for descriptions.
- Stamp copyright: © 2006 - <Year> johnandjeri.com.
- ThumbnailService generates on-demand cached JPEG thumbnails (240×240, 480×480).

### 8. Frontend Context & Provider Stack
Hierarchy: RootContextProvider → JJSAuthProvider → ApiContextProvider → MantineProvider → RouterProvider.

### 9. Data Fetching Strategies
- **SWR**: Lists, live interactions, optimistic updates.
- **React Router loader**: Pre-load detail views (/post/:id, /recipe/:id, /admin/*).
- **Forms**: @mantine/form + mantine-form-zod-resolver + Zod schemas.

---

## 4. Database Schema (17 Tables)

**Core**: Users, Posts, Comments, PostReactions, CommentReactions, Recipes, RecipeInstructions, Ingredients, UnitOfMeasure, Ingredients_xref, Categories, CategoryTypes, PostCategories, RecipeCategories, RecipeCategory_xref, Attachments, PostAttachments.

**Key Columns**:
- **Posts**: Body (Markdown), CircleOfTrust (BIT), Archived (BIT), ViewCount (BIGINT).
- **Comments**: AdminHidden, ScreenedBy, ScreenResult, ParentCommentFk (nested replies).
- **Reactions**: Unique [PostFk, Email, Emoji] and [CommentFk, Email, Emoji] constraints.
- **Users**: IsDisabled, Blocked, BlockedBy, BlockedDate, BlockedReason.

**Views**: w_cust_PostCategorySummary, w_cust_CategorySummary, w_cust_IngredientsXrefSummary.

**Functions**: ConcatCategories(), SplitList(), ConvertHtmlToMarkdown().

---

## 5. API Endpoints (All Prefixed /api/)

**Auth**: GET /api/auth/getcurrentuser (Authorized).

**Posts**: GET /api/post, POST /api/post (Admin), PATCH /api/post/view/{id}, GET /api/post/getall (Admin), POST /api/post-image (Admin), GET /api/post-image/{fileName}.

**Recipes**: GET /api/recipe, GET /api/recipe/{id}, POST /api/recipe (Admin).

**Categories & Ingredients**: GET /api/category, GET /api/ingredient, POST /api/ingredient (Admin), GET /api/unitofmeasure.

**Albums & Images**: GET /api/album, POST /api/album/upload (Admin), POST /api/album/folder (Admin), POST /api/album/refresh (Admin), GET /api/image/{path}, GET /api/thumbnail/{*path}.

**Attachments**: GET /api/attachment/{id}, GET /api/attachment/{id}/content, POST /api/attachment (Admin).

**Comments**: GET /api/comment/getbypost/{postId}, GET /api/comment/getreplies/{commentId}, POST /api/comment/addforpost/{postId} (Auth), PATCH /api/comment/hidecomment/{id} (Admin), PATCH /api/comment/unhidecomment/{id} (Admin), GET /api/comment/getall (Admin).

**Reactions**: GET /api/reaction/getbypost/{postId}, POST /api/reaction/toggle/{postId} (Auth), GET /api/reaction/getbycomment/{commentId}, POST /api/reaction/togglecomment/{id} (Auth).

**Users**: GET /api/user/getall (Admin), PATCH /api/user/blockuser (Admin), PATCH /api/user/unblockuser (Admin), PATCH /api/user/setrole (Admin).

**Diagnostics**: GET /diag, GET /api/debug-auth (Debug).

---

## 6. Frontend Route Map

**Public**: /, /album, /post, /post/:id, /recipe, /recipe/:id, /things, /login, /about, /unauthorized.

**Protected (CircleOfTrust/Admin)**: /things/wedding.

**Admin**: /admin, /admin/posts, /admin/post/new, /admin/post/:id, /admin/recipes, /admin/recipe/:id, /admin/users, /admin/album, /admin/comments.

---

## 7. TypeScript & Frontend Rules

**Path Aliases**: @ → src/, @lib → src/lib/, @api → src/api/, @components → src/components/, @pages → src/pages/.

**Compiler**: erbatimModuleSyntax: true requires explicit import type.

**No TypeScript enum** — use const objects with s const + union types.

**Mantine CSS Import Order** (in App.tsx): @mantine/core/styles.css, then @mantine/carousel/styles.css.

**Forms**: Always @mantine/form + mantine-form-zod-resolver + strict Zod schemas.

---

## 8. C# & Backend Rules

**Primary Constructors**: public class Foo(IService service) : IFoo { }.

**Field-Backed Properties**: Use ield keyword.

**Nullable Reference Types**: Enable globally.

**No EF Core** — All raw SQL in *_Sql.cs constants.

**Parameterized Queries**: @paramName placeholders, Dapper binding.

**MERGE for Upserts**: SQL Server MERGE in PostRepository, UserRepository.

**Async/Await**: QueryAsync<T>, ExecuteScalarAsync, ExecuteAsync.

**Cache Invalidation**: Call _cacheService.Clear(CacheKey.Xyz) explicitly in write methods.

**Middleware Pipeline**: Swagger → CORS → Authentication → UserValidationMiddleware → Authorization → Static Files → Routes → SPA Fallback.

**CORS Allowed**: localhost:3000, 5173, 5174 (dev); johnandjeri.com (prod).

---

## 9. Build, Test & Deployment

**Local Dev**:
- dotnet run --project Aspire/JJS.AppHost/JJS.AppHost.csproj (orchestrated).
- cd jjs-web && npm run dev (frontend dev server).
- dotnet test JJS.Api.Tests/JJS.Api.Tests.csproj (unit tests).

**Vite Build Modes**: dev, uild, localiis (local IIS), winhost (production).

**CI/CD** (.github/workflows/deploy.yml):
1. Test: dotnet test
2. Build API: dotnet publish -c Release -r win-x86 -o ./publish-output/api
3. Build UI: cd jjs-web && npm ci && npm run winhost
4. Deploy via FTP: Offline → API root → UI /ui/ → Online

**Production**: Windows Server / IIS. API at /, UI at /ui/. GitHub Secrets: FTP_SERVER, FTP_USERNAME, FTP_PASSWORD.

---

## 10. Token Savers & Large File Boundaries

**Do NOT scan**: JJS.Api/Albums/, *.jpg, *.png, *.gif, *.mp4, *.pdf, Database/*.dbmdl, publish-output/, jjs-web/dist/, in/, obj/, 
ode_modules/, *.lock, package-lock.json, yarn.lock, pnpm-lock.yaml, *.log, migrations/*.sql.

---

## 11. Important Reference Files

| File | Purpose |
|---|---|
| JJS.sln | Solution file |
| JJS.Api/AppBuilder.cs | Middleware & DI pipeline |
| JJS.Api/Program.cs | Entry point, static mapping, SPA fallback |
| JJS.Api/Models/ServiceImplementationAttribute.cs | Custom DI attribute |
| JJS.Api/Models/CacheKey.cs | Cache key constants |
| JJS.Api/Middleware/UserValidationMiddleware.cs | User provisioning & role enrichment |
| JJS.Api/Services/Cache/MemoryCacheService.cs | In-memory cache wrapper |
| JJS.Api/Services/CommentModerationService.cs | Gemini AI comment screening |
| JJS.Api/Services/Image/MetaDataService.cs | EXIF extraction & watermarking |
| JJS.Api/Services/Image/ThumbnailService.cs | On-demand thumbnail generation |
| jjs-web/src/routes.tsx | React Router v8 routes |
| jjs-web/src/lib/auth/authContext.tsx | Google OAuth & token state |
| jjs-web/src/lib/httpClient.ts | Axios + JWT interceptor |
| jjs-web/src/App.tsx | Root MantineProvider & theme |
| jjs-web/package.json | Frontend deps & scripts |
| jjs-web/.env | Dev environment variables |
| Database/Scripts/Migrate.sql | DB migration script |
| .github/workflows/deploy.yml | CI/CD pipeline |
| README.md | Project history & setup |

---

## 12. State Block — Outstanding Tasks & Tech Debt

### Test Coverage
- ✅ **Backend Tests**: NUnit 4.6.1 + NSubstitute present. Tested: Album, Comment, Moderation, Post services.
- ❌ **Missing Backend**: RecipeService, UserService, ReactionService, MetaDataService, ImageMatchService.
- ❌ **Frontend Tests**: Zero tests (Vitest / Playwright not configured).

### Outstanding Feature Tasks
| Task | Priority | Notes |
|---|---|---|
| Automated Migration Tooling | Medium | Replace manual Database/Scripts/*.sql with DbUp, FluentMigrator, or Flyway. |
| Background Workers | Low | Decouple sync Post ViewCount & Gemini AI comment moderation. |
| Persistent Auth / Refresh Tokens | Low | JWT lost on tab close; optional localStorage remember-me with expiration. |
| Zero-Downtime Deployment | Low | FTP with app_offline.htm causes downtime; evaluate IIS blue/green. |
| Frontend Unit Tests | Low | Vitest + @testing-library/react + Playwright E2E. |
| Recipe Service Tests | Low | NUnit coverage for recipe CRUD & ingredient relationships. |

### Technical Debt
- **Dapper Raw SQL**: Query strings in *_Sql.cs lack compile-time verification.
- **Legacy Schema**: Comments table uses NTEXT (should be NVARCHAR MAX).
- **Manual Migrations**: No automated migration runner.
- **FTP Fragility**: Brief downtime during deploys; no true blue-green strategy.
- **No Batch Thumbnails**: Generated on-demand; no pre-generation for large albums.

---

## 13. Mantine UI Documentation

For accurate, version-current APIs:
- **Compact**: https://mantine.dev/llms.txt
- **Full**: https://mantine.dev/llms-full.txt (~1.8 MB)

Fetch these URLs when working on Mantine components.

---

## 14. Quick Dev Checklist

**Before Committing**:
- [ ] dotnet build — no compiler errors
- [ ] dotnet test — backend tests pass
- [ ] Frontend: 
pm run build in jjs-web/ — no errors
- [ ] Check .claudeignore — don't commit large assets

**Adding a Feature**:
1. **Backend**: Create repository (Foo.cs + Foo_Sql.cs), service (FooService.cs), controller (FooController.cs).
2. **Database**: Add tables/views to Database/dbo/, migrate in Database/Scripts/Migrate.sql.
3. **Frontend**: Add API client (ooApi.ts) + Zod schema, wire routes/pages.
4. **Tests**: Add NUnit tests in JJS.Api.Tests/.
5. **Commit**: Include [ServiceImplementation] attribute on service, [Authorize] on controllers, update this profile if architectural patterns change.

---

**Last Updated**: 2026-08-15  
**Repository**: johnandjeri.com — Digital home of John & Jeri since 2006, rebuilt 2026 with modern cloud-native stack.

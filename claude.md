# Project Guide: jjs (.NET 10 Aspire + React, Vite, & Mantine UI)

## Core Tech Stack & Rules
- Runtime: .NET 10.0 (LTS) / C# 14
- Database & ORM: MS SQL Server / EF Core 10 via .NET Aspire
- Frontend: React / TypeScript / Vite / Mantine UI (Strict types, no implicit `any`)
- C# 14 Idioms: Use 'field' backed properties; favor extension members; use primary constructors.

## Database & Asset Boundaries (Token Savings)
*Do not read raw database logs, large seed data, or media folders.*
- Database: Target is SQL Server. Configuration is handled natively by .NET Aspire.
- SQL Assets: Structured files are located in `Database/Scripts/`. 
- Media Storage: Static images and binaries are restricted to `JJS.Api/Albums/`. Avoid scanning this directory.

## Common Development Commands

### Orchestration, Building & Tests
```bash
# Run orchestrated app (Frontend, Backend, and SQL containers via Aspire)
dotnet run --project Aspire/JJS.AppHost/JJS.AppHost.csproj

# Build backend artifacts / Run Tests
dotnet build JJS.sln
dotnet test

# Configure local Google Auth Secrets
dotnet user-secrets set "Authentication:Google:ClientId" "your-id" --project Aspire/JJS.AppHost/JJS.AppHost.csproj
dotnet user-secrets set "Authentication:Google:ClientSecret" "your-secret" --project Aspire/JJS.AppHost/JJS.AppHost.csproj
```

### Frontend Tasks
```bash
cd jjs-web && npm install
cd jjs-web && npm run dev
```

## High-Level Architecture Map
1. `Aspire/JJS.AppHost/`: Central .NET Aspire orchestration and service bindings.
2. `Aspire/JJS.ServiceDefaults/`: Shared OpenTelemetry, logging pipelines, and health checks.
3. `JJS.Api/`: .NET 10 Web API controllers, models, and data logic.
4. `jjs-web/`: React single-page application built on Vite and Mantine hooks.
5. `Database/Scripts/`: Core SQL Server migration, schema, and seed scripts.

## Important Reference Files
- `JJS.sln`: Master solution routing file.
- `Aspire/JJS.AppHost/appsettings.json`: Aspire runtime environment map.
- `jjs-web/package.json`: Client script targets and framework dependencies.
- `README.md`: High-level summary of project roots, operational updates, system history, and prerequisite installation links.

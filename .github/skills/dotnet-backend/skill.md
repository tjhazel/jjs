---
name: dotnet-backend
description: .NET 10/C# 14 backend development conventions for the JJS.Api ASP.NET Core REST API, including Dapper repositories, SQL Server, service-layer patterns, dependency injection, authentication, authorization, caching, and API configuration.
---

# .NET Backend Development

Use this skill when working on the `JJS.Api` ASP.NET Core backend.

## Technology Stack

- Runtime: .NET 10.0 (LTS)
- Language: C# 14
- API: ASP.NET Core REST API
- Database: Microsoft SQL Server
- ORM/data access: Dapper
- SQL: Raw SQL + Dapper everywhere
- Authentication: Google JWT / ASP.NET Core JwtBearer
- API documentation: Swagger
- Dependency injection: Custom `[ServiceImplementation]` attribute
- Caching: In-memory `MemoryCacheService`
- Observability/resilience: .NET Aspire ServiceDefaults

### Core Rules

- **Do not use Entity Framework Core.**
- All database access uses raw SQL through Dapper.
- Use asynchronous Dapper APIs such as `QueryAsync`.
- Bind values through Dapper parameters rather than string interpolation.
- Follow existing repository/service patterns rather than introducing new architectural patterns.
- Use C# 14 idioms, including `field`-backed properties, extension members, and primary constructors where appropriate.

## Project Structure

The backend project is:

```text
JJS.Api/
├── Controllers/
├── Services/
├── Repositories/
├── Models/
├── Middleware/
└── ...
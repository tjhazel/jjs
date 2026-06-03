# JJS — John, Jeri, And Sidney

A full-stack web application built for John, Jeri, and Sidney. The solution combines a TypeScript frontend, a C# REST API, a SQL Server database, and .NET Aspire for local orchestration — all managed in a single Visual Studio solution.

![logo](logo.png)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | TypeScript / `jjs-web` |
| API | ASP.NET Core (C#) |
| Database | SQL Server (T-SQL) |
| Orchestration | .NET Aspire |

---

## Repository Structure

```
jjs/
├── Aspire/
│   ├── JJS.AppHost/          # .NET Aspire host — wires up all services locally
│   └── JJS.ServiceDefaults/  # Shared service configuration (health checks, telemetry, etc.)
├── Database/                 # SQL Server database project (.sqlproj)
├── JJS.Api/                  # ASP.NET Core Web API (C#)
├── jjs-web/                  # Frontend web application (TypeScript)
├── JJS.sln                   # Visual Studio solution file
└── logo.png
```

---

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (for the `jjs-web` frontend)
- [SQL Server](https://www.microsoft.com/en-us/sql-server) (local or Docker)
- [Visual Studio 2022+](https://visualstudio.microsoft.com/) or the .NET CLI

### Run with .NET Aspire (recommended)

.NET Aspire handles starting the API, database, and any other dependencies together.

```bash
cd Aspire/JJS.AppHost
dotnet run
```

The Aspire dashboard will open in your browser and show logs and resource status for all running services.

### Run services individually

**API**
```bash
cd JJS.Api
dotnet run
```

**Frontend**
```bash
cd jjs-web
npm install
npm run dev
```

**Database**

Open `JJS.sln` in Visual Studio and publish the `Database` project to your local SQL Server instance, or use the SQL Server Object Explorer to deploy the `.sqlproj`.

---

## Development

Open `JJS.sln` in Visual Studio 2022 or later. All four projects — `JJS.Api`, `jjs-web`, `Database`, `JJS.AppHost`, and `JJS.ServiceDefaults` — are included in the solution.

Build configurations available: `Debug` and `Release` (Any CPU).

---

## License

[MIT](LICENSE)

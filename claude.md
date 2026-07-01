# Project Guide: jjs (.NET 10 Aspire + React, Vite, & Mantine UI)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Building and Running
To run the full orchestrated distributed application locally (including frontend, backend, and containerized resources), execute:
```bash
dotnet run --project Aspire/JJS.AppHost/JJS.AppHost.csproj
```
To build the backend solution artifacts directly:
```bash
dotnet build JJS.sln
```

### Frontend Environment Setup
Navigate to the single-page application directory to install dependencies or run standalone client tasks:
```bash
cd jjs-web && npm install
cd jjs-web && npm run dev
```

### Running Tests
To validate the backend application and run the automated test suites:
```bash
dotnet test
```

---

## Setup and Configuration

The workspace relies on modern .NET project configurations, containerized resource management, solution orchestration via .NET Aspire, and an standard npm workspace for the client application.

### Environmental Dependencies
- **Container Runtime:** Docker Desktop or Podman must be running locally. It is required by .NET Aspire to orchestrate localized database infrastructure and containers.
- **Package Management:** Use `npm` inside the `jjs-web` directory for frontend dependencies. The web client is bundled using Vite.
- **Local Secrets:** Google Authentication credentials must be managed securely on development machines via .NET User Secrets inside the AppHost project:
  ```bash
  dotnet user-secrets set "Authentication:Google:ClientId" "your-google-client-id" --project Aspire/JJS.AppHost/JJS.AppHost.csproj
  dotnet user-secrets set "Authentication:Google:ClientSecret" "your-google-client-secret" --project Aspire/JJS.AppHost/JJS.AppHost.csproj
  ```

---

## High-Level Code Architecture

The codebase is split into an orchestrated cloud-native backend layer and a decoupled modern React web app:

1. **Orchestration (`Aspire/`)**
   - `JJS.AppHost/`: Central .NET Aspire orchestrator that hooks together backend services, frontend lifecycles, container settings, and initialization variables.
   - `JJS.ServiceDefaults/`: Handles shared telemetry, OpenTelemetry configurations, logging pipelines, and network health metrics.

2. **Backend (`JJS.Api/`)**
   - Built on the `.NET 10` runtime. Contains service controllers, data mappings, and endpoint logic.
   - `Albums/`: Houses raw image files and static media assets served by the API.

3. **Frontend (`jjs-web/`)**
   - A single-page application built on `React`, `TypeScript`, and `Vite`. Styled natively using the `Mantine UI` library components.

4. **Database (`Database/`)**
   - `Scripts/`: Contains custom SQL migrations, structural schemas, and seed data scripts targeted for Microsoft SQL Server container components.

5. **Deployment & CI/CD (`.github/workflows/` & `deployment/`)**
   - Automated GitHub Actions continuous integration scripts that trigger builds, solution tests, linter checks, and telemetry summary generation on pull requests or merges.

---

## Architecture Notes

- **Orchestration Model:** The application utilizes .NET Aspire. The central Aspire Dashboard (typically targetable at `https://localhost:17001`) manages live traces, logs, container orchestration status, and active endpoints at runtime.
- **Frontend Standards:** React components are strictly written in TypeScript. Avoid utilizing implicit `any` definitions. Leverage native Mantine UI components and hooks (e.g., Mantine Carousel) to ensure user interface consistency.
- **Identity & Auth:** Authentication relies on modern token exchanges brokered through Google Sign-In and handled securely on the backend via `Microsoft.AspNetCore.Authentication.Google`.

---

## Important Files

- `JJS.sln`: Core solution file managing backend projects, database resources, and orchestration references.
- `Aspire/JJS.AppHost/appsettings.json`: Configuration mappings and infrastructure bindings for the Aspire runtime.
- `jjs-web/package.json`: Contains frontend asset declarations, scripts, metadata, and Mantine/Vite library dependencies.
- `README.md`: High-level summary of project roots, operational updates, system history, and prerequisite installation links.

---

This guide outlines the jjs repository structure and local toolsets. By checking these protocols on initialization, Claude Code can rapidly navigate the repository, enforce correct tech-stack standards, and execute precise development tasks.

## jjs
A modern, cloud-native web application built with .NET 10, orchestrated via .NET Aspire, and featuring a highly responsive frontend powered by React, TypeScript, and Mantine UI. Continuous integration and deployment are fully managed using GitHub Actions.
## ⏳ Project History
The jjs repository carries a rich history that mirrors the evolution of the web over the last two decades:

* 2006 (The WebForms Era): The site was originally created to showcase ASP.NET WebForms, which was cutting-edge Microsoft technology at the time. It primarily served as a travel blog to document a journey through Australia and New Zealand, featuring a custom-built comments section that allowed family and friends to stay engaged and connected across the globe.
* The Recipe Transition: In later years, as the travel journey concluded, the site evolved into a digital cookbook, updated to host and share favorite family recipes.
* 2026 (The Modern Refresh): This most recent iteration represents a complete architectural overhaul. The legacy codebase has been completely retired to showcase modern, cloud-native web development practices, transforming the platform into a high-performance blueprint for contemporary full-stack engineering.

------------------------------
## 🚀 Tech Stack## Backend & Orchestration

* .NET 10 Runtime – Leveraging the latest features and performance enhancements in C# and the .NET ecosystem.
* .NET Aspire – An opinionated, cloud-ready stack for building and managing distributed applications. Handles service discovery, telemetry, and container resilience out of the box.

## Frontend

* React & TypeScript – Strong typing and component-driven architecture for a predictable UI development lifecycle.
* Mantine UI – A fully-featured React component library providing robust hooks, pre-styled elements, and native components like Mantine Carousel.

## DevOps & Infrastructure

* GitHub Actions – Automated workflows handling continuous integration (CI) tests, code quality linting, and continuous delivery (CD) deployment scripts.

------------------------------
## 📂 Architecture Overview
The repository structure follows standard .NET Aspire and decoupled React frontend conventions:

```text
├── .github/workflows/    # GitHub Actions CI/CD workflows
├── src/
│   ├── Jjs.AppHost/      # .NET Aspire AppHost (orchestrates backend & frontend)
│   ├── Jjs.ServiceDefaults/ # Shared telemetry, logging, and health metrics
│   ├── Jjs.ApiService/   # Backend REST/gRPC API service (.NET 10)
│   └── jjs-frontend/     # React + TypeScript single page application
└── README.md
```
------------------------------
## 🛠️ Getting Started## Prerequisites
Before running the application locally, ensure you have the following installed:

   1. [.NET 10 SDK](https://dotnet.microsoft.com/download)
   2. [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Podman (Required by .NET Aspire for containerized resources)
   3. [Node.js (v18+) & npm/yarn](https://nodejs.org/)

## Local Development Setup

   1. Clone the Repository
   
   git clone https://github.com
   cd jjs
   
   2. Install Frontend Dependencies
   
   cd src/jjs-frontend
   npm install
   cd ../..
   
   3. Run via .NET Aspire AppHost
   Navigate to the AppHost directory and start the orchestration server:
   
   dotnet run --project src/Jjs.AppHost/Jjs.AppHost.csproj
   
   4. Access the Dashboard
   Once started, the console will output a link to the .NET Aspire Dashboard (usually https://localhost:17001). This central dashboard provides access to:
   * Frontend web applications
      * Backend APIs
      * Distributed logs, traces, and metrics
   
------------------------------
## 🤖 CI/CD with GitHub Actions
The repository uses automated GitHub Actions workflows defined under .github/workflows/.

* On Pull Request / Push to Main:
* Validates the .NET 10 backend builds and runs automated test suites.
   * Lints and builds the React/TypeScript frontend.
   * Generates telemetry check summaries.

# Project Standards (AGENTS.md)

## Tech Stack
* Frontend: React, Mantine UI v9, TypeScript
* Backend: C#, .NET Core, MS SQL Server

## Agent Capabilities
Specific sub-domain agent instructions are stored modularly.
* For general React/TypeScript work, trigger: `.github/skills/react-typescript/skill.md`
* For Mantine-specific UI work, also trigger: `.github/skills/mantine-frontend/skill.md`
* For DB/API work, trigger: `.github/skills/dotnet-backend/skill.md`

## Build & Test Commands
* Frontend: `npm run build` / `npm run test`
* Backend: `dotnet build` / `dotnet test`

@AGENTS.md

## Claude Core Directives
* Before writing C# or React code, locate and match instructions inside the `.github/skills/` directory.

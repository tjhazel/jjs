This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Common Development Commands

Building and Running

To build the codebase and run it locally, execute the following command:

npm run build && node .\app.js

This will compile the code and start the application on the provided URL.

Linting

For linting and checking for potential issues, use:

npm run lint

Running Tests

To run all tests, use:

npm run test

To run specific tests, use:

npm run test:specific test-name

Debugging

For debugging purposes, use:

node --inspect node_modules/react-scripts/node_modules/webpack/lib/Compilation.js

Setup and Configuration

The codebase is configured using package.json and yarn.config.js. Ensure that:

- npm install is run after updating the package.json to include any new dependencies.
- yarn is used for package management tasks, including yarn install, yarn add, and yarn remove.

High-Level Code Architecture

The codebase is structured into the following main components:

1. Frontend
   - frontend/src directory contains the React application code.
   - frontend/.env.development and frontend/.env.production files contain environment-specific variables.
2. Backend
   - backend/server.js and backend/api.js define the API endpoints and routes.
   - backend/auth.js handles authentication logic for user accounts.
3. Database
   - backend/db.js connects to the MongoDB database and sets up the schema.
   - backend/migrations directory contains migration files for database schema changes.
4. Utilities
   - utils directory contains utility functions and classes for common operations.
   - utils/api directory contains utility functions for interacting with external APIs.
5. Scripts and Commands
   - scripts directory contains custom scripts for development tasks.
   - scripts/test directory contains custom test scripts for running integration or end-to-end tests.
6. Build and Deployment
   - scripts/build directory contains scripts for building the code and preparing it for deployment.
   - scripts/deploy directory contains scripts for deploying the code to a production environment.
7. Testing
   - scripts/test directory contains custom test scripts for running unit, integration, or end-to-end tests.
   - scripts/test:unit directory contains scripts for running unit tests.
   - scripts/test:integration directory contains scripts for running integration tests.
   - scripts/test:end-to-end directory contains scripts for running end-to-end tests.

Architecture Notes

- The codebase uses a monolithic architecture, where all components are interconnected.
- The React application is stateless and uses hooks for state management.
- The database is designed for scalability and is hosted on SQL Server DB.
- The authentication system uses Google Issues JWT tokens to secure user sessions.
- The API endpoints are designed to be RESTful, with resources organized into a hierarchical structure.

Important Files

package.json

The package.json file contains metadata about the project, including dependencies and scripts. It is essential for installing
necessary packages and setting up development environment.

.env.development and .env.production

The .env.development and .env.production files store environment-specific variables, such as database URLs, API keys, and
user credentials. These files are configured differently for development and production environments.

yarn.config.js

The yarn.config.js file specifies the configuration for yarn, including package resolution, dependency management, and
installation commands.

scripts

The scripts directory contains custom scripts for development tasks. These scripts can be used to automate various
development activities, such as building the code, running tests, and setting up development environment.

scripts/test

The scripts/test directory contains custom test scripts for running unit, integration, or end-to-end tests. These scripts
automate the testing process, ensuring thorough coverage and efficient testing workflows.

scripts/test:unit

The scripts/test:unit directory contains scripts for running unit tests. These scripts execute unit tests and provide
feedback on the coverage and health of individual components.

scripts/test:integration

The scripts/test:integration directory contains scripts for running integration tests. These scripts execute integration
tests, ensuring that the application behaves correctly across multiple components and dependencies.

scripts/test:end-to-end

The scripts/test:end-to-end directory contains scripts for running end-to-end tests. These scripts execute end-to-end tests,
verifying the overall functionality and user experience of the application.

This guide provides an overview of the codebase and the tools available to manage development tasks. By following these
instructions, future instances of Claude Code can quickly and effectively navigate the repository, focusing on key components
and tools to facilitate development and testing.
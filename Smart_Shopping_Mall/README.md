# Smart Shopping Mall

Monorepo scaffold for the Smart Shopping Mall project.

## Structure

- `apps/admin-web`: Vue 3 admin app for tutorial replication
- `apps/storefront-web`: Vue 3 storefront app for phase 2 enhancement
- `apps/api-server`: Spring Boot multi-module backend using a parent `pom.xml`
- `packages`: shared frontend packages
- `database`: Flyway migrations, seeds, and schema docs
- `docs`: architecture, API, deployment, and product documents
- `infra`: Docker, Nginx, and environment scripts
- `tools`: code generation and devops scripts

## Current status

This iteration creates the workspace skeleton and base build files only. Business code will be added incrementally by phase.
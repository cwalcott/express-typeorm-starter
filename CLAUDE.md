# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with file-based PGlite database
- `npm run dev:fresh` - Start with fresh database and fixtures (removes ./data)
- `npm run dev:postgres` - Use full PostgreSQL instead of PGlite
- `npm run dev:postgres:fresh` - PostgreSQL with forced fixture reload

### Testing
- `npm test` - Run test suite with Vitest (uses in-memory PGlite)
- `npm run test:watch` - Run tests in watch mode

### Build and Production
- `npm run build` - TypeScript compilation to ./dist
- `npm start` - Start production server (requires build first)

### Database Management
- `npm run migration:generate` - Generate TypeORM migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration

## Architecture Overview

This is a flexible REST API that supports three database modes through a unified configuration system:

### Database Flexibility System
The core innovation is in `src/config/database.ts` which provides environment-aware database selection:
- **Development**: File-based PGlite (`./data/dev.db`) with automatic fixtures
- **Testing**: In-memory PGlite for isolation and speed  
- **Production**: Full PostgreSQL via `DATABASE_URL`

### Key Architecture Components

**Database Layer** (`src/database/`):
- `dataSource.ts` - Creates TypeORM DataSource with driver abstraction for PGlite/PostgreSQL
- `initialization.ts` - Smart database setup logic that detects existing files and loads fixtures
- `fixtures.ts` - Sample data management for development/testing

**Configuration** (`src/config/database.ts`):
- Environment-aware database type selection
- Automatic fixture loading logic
- Override support via environment variables

**Entry Point** (`src/server.ts`):
- Express server with graceful shutdown handling
- Health check endpoint at `/health` with database status
- Centralized error handling

### Database Mode Selection Logic
1. `NODE_ENV=test` → Always in-memory PGlite with fixtures
2. `DATABASE_TYPE=postgres` → Force PostgreSQL in any environment
3. `NODE_ENV=development` → File-based PGlite (default)
4. `NODE_ENV=production` → PostgreSQL (requires `DATABASE_URL`)

### Important Environment Variables
- `DATABASE_TYPE=postgres` - Override to use PostgreSQL
- `DATABASE_URL` - PostgreSQL connection string  
- `FORCE_FIXTURES=true` - Reload fixtures even with existing data
- `NODE_ENV` - Controls database mode and synchronization

### TypeORM Configuration Notes
- Development uses `synchronize: true` for rapid schema changes
- Production should disable synchronization and use migrations
- Entities are centrally registered in `dataSource.ts`
- PGlite uses the typeorm-pglite adapter for compatibility

### Testing Strategy
Tests use isolated in-memory databases with automatic fixture loading via the test setup in `src/test/setup.ts`. Each test gets a fresh database instance.

### File Structure Key Points
- `src/entities/` - TypeORM entity definitions
- `src/routes/` - Express route handlers  
- `./data/` - PGlite database files (gitignored)
- Routes follow REST conventions under `/api/` prefix
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Validation & Quality Assurance
- `npm run ci` - **Primary validation command** - runs typecheck, lint, format:check, unit tests, and integration tests
- `npm run typecheck` - TypeScript compilation check without emitting files
- `npm test` - Run all tests (both unit and integration)
- `npm run test:unit` - Run unit tests only (fast, pure business logic)
- `npm run test:integration` - Run integration tests only (slower, full stack with database)
- `npm run test:watch` - Run all tests in watch mode (development)
- `npm run test:watch:unit` - Run unit tests in watch mode
- `npm run test:watch:integration` - Run integration tests in watch mode
- `npm run test:coverage` - Run tests with coverage reporting
- `npm run lint` - Check code quality with ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is properly formatted

### Core Development
- `npm run dev` - Start development server with file-based PGlite database
- `npm run dev:fresh` - Start with fresh database and fixtures (removes ./data)
- `npm run dev:postgres` - Use full PostgreSQL instead of PGlite
- `npm run dev:postgres:fresh` - PostgreSQL with forced fixture reload

### Build and Production
- `npm run build` - TypeScript compilation to ./dist
- `npm run build:prod` - Production build with NODE_ENV=production
- `npm start` - Start production server (requires build first)
- `npm run start:prod` - Start production server with NODE_ENV=production

### Database Management
- `npm run db:reset` - Reset database completely (removes ./data and starts fresh)
- `npm run db:seed` - Load fixtures into existing database
- `npm run migration:generate` - Generate TypeORM migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration

### Utilities
- `npm run clean` - Remove build artifacts and cache files
- `npm run reset` - Complete reset (removes node_modules and reinstalls)

## Development Workflow

**CRITICAL**: Always check TypeScript compilation FIRST before running tests:

1. **TypeScript First**: Run `npm run typecheck` immediately after making code changes
   - TypeScript errors must be fixed before proceeding to tests
   - Tests can fail misleadingly if TypeScript compilation is broken
   - This saves time by catching type issues early

2. **Full Validation**: After TypeScript passes, run `npm run ci` to ensure:
   - TypeScript compilation passes (`typecheck`)
   - Code quality standards are met (`lint`)
   - Code formatting is consistent (`format:check`) 
   - All tests pass (`test`)

**Best Practice Order**:
```bash
npm run typecheck  # Fix any TypeScript errors first
npm run ci         # Then run full validation suite
```

If `npm run ci` fails, fix the issues immediately. This catches problems early rather than discovering them at commit time.

**IMPORTANT: Always run `npm run ci` after making code changes** to catch all issues (TypeScript, linting, formatting, and tests) before considering work complete. If formatting issues are found, run `npm run format` to auto-fix them, then re-run `npm run ci` to verify everything passes.

**CRITICAL: Feature Completion Standards**:
A feature is NOT considered complete until ALL of the following pass without errors:
- ✅ `npm run typecheck` - No TypeScript compilation errors
- ✅ `npm run lint` - No ESLint errors or warnings  
- ✅ `npm run format:check` - Code formatting is consistent
- ✅ `npm run test` - All tests pass (both unit and integration)

**Never mark a feature as "complete" or "good to go" if any CI checks are failing.** It's acceptable to ask for help if stuck on fixing failing tests or linting issues, but incomplete features should not be presented as finished work.

**Working with Third-Party Libraries**:
When integrating new libraries (like Zod, validation libraries, etc.):

1. **Embrace library defaults** - Don't fight the library's natural behavior or error messages. If a library provides reasonable default error messages, use them rather than creating complex workarounds.

2. **Read documentation thoroughly** - Check the specific version's documentation for supported features. Don't assume newer API features are available in older versions.

3. **Update tests pragmatically** - Sometimes it's better to update test expectations to match library reality rather than forcing library behavior to match existing tests. This is especially true for error messages and validation behavior.

4. **Follow library philosophy** - Each validation/utility library has its own approach (e.g., type-first validation vs custom messages). Work with that philosophy rather than against it.

5. **Separation of concerns** - Keep validation at the route level (input validation) separate from business logic at the service level (data operations). Don't duplicate validation logic across layers.

**TODO Task Management**: When implementing features or fixes from TODO.md, check off completed items by changing `[ ]` to `[x]` to track progress and maintain project status visibility.

## Architecture Overview

This is a flexible REST API that supports three database modes through a unified configuration system:

### Database Flexibility System
The core innovation is in `src/config/database.ts` which provides environment-aware database selection:
- **Development**: File-based PGlite (`./data/dev.db`) with automatic fixtures
- **Testing**: In-memory PGlite for isolation and speed  
- **Production**: Full PostgreSQL via `DATABASE_URL`

### Key Architecture Components

**Database Layer** (`src/database/`):
- `data-source.ts` - Creates TypeORM DataSource with driver abstraction for PGlite/PostgreSQL
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
- Entities are centrally registered in `data-source.ts`
- PGlite uses the typeorm-pglite adapter for compatibility

### Dependency Injection & Testing Strategy

**Pure Dependency Injection Pattern**:
This project uses a "Pure DI" approach without framework complexity:

- **Composer Pattern** (`src/di/composer.ts`): Centralized dependency wiring
  - `Composer` class handles object construction and dependency injection
  - `createLiveComposer()` handles environment setup (database initialization)
  - No decorators, metadata, or runtime magic - everything is compile-time safe

- **Service Layer Architecture**: Services receive dependencies through constructor injection
  - Services take TypeORM `Repository<T>` directly (no custom repository wrappers)
  - Routes become factory functions that receive configured services
  - Clear separation: Routes → Services → Repository → Database

- **Testing Benefits**: 
  - Unit tests use fake repositories with `as any` (ESLint disabled in test files)
  - Integration tests use real `createLiveComposer()` with actual databases
  - Fast unit tests (~2ms) vs slower integration tests (~700ms per setup)

**Three-Layer Testing Approach**:

**Unit Tests** (`src/test/unit/`):
- **Lightning fast execution** (no database, ~0ms overhead per test)
- Test service business logic with fake repository implementations
- Use simple object fakes: `{ findOne: async () => mockUser } as any`
- Focus on: error handling, business rules, edge cases, validation
- Example: Testing UserService CRUD methods with various success/failure scenarios

**Entity Integration Tests** (`src/test/integration/`):
- Test database layer with TypeORM entities and real PGlite databases
- Use isolated in-memory PGlite databases with automatic fixture loading
- Each test gets a fresh database instance via `src/test/integration/setup.ts`
- Example: Testing User entity CRUD operations, constraints, relationships

**Route Integration Tests** (`src/test/integration/`):
- Test complete HTTP → Route → Service → Database stack
- Use supertest for real HTTP requests through Express app
- Created via `src/test/integration/test-app.ts` factory with real composer
- Test full request/response cycle with proper status codes, validation, error handling
- Example: `POST /api/users` with input validation, database persistence, unique constraints

**Development Workflow**:
1. Write unit tests for service logic (fast feedback loop)
2. Write integration tests for HTTP endpoints (full stack validation)
3. Use `npm run test:unit` during development, `npm run test:integration` for confidence
4. Unit tests run in ~300ms, integration tests in ~10s

### File Structure Key Points
- `src/entities/` - TypeORM entity definitions
- `src/routes/` - Express route factory functions (receive injected services)
- `src/services/` - Business logic with constructor-injected dependencies
- `src/di/` - Dependency injection and composition root
- `src/test/unit/` - Fast unit tests for service logic with fake repositories
- `src/test/integration/` - Entity and route integration tests with real databases
  - `setup.ts` - Test database configuration
  - `test-app.ts` - Express app factory for HTTP testing
  - `*-routes.test.ts` - HTTP endpoint tests using supertest
  - `*.test.ts` - Entity/database layer tests
- `./data/` - PGlite database files (gitignored)
- Routes follow REST conventions under `/api/` prefix

**When adding new services:**
1. Create service class with constructor injection: `constructor(private repository: Repository<Entity>)`
2. Add service creation method to `Composer` class
3. Write fast unit tests with fake repositories in `src/test/unit/`
4. Update route factory to receive the service as parameter

**When adding new routes:**
1. Create route factory function in `src/routes/` that takes service dependencies
2. Update `Composer` and server setup to wire the route with dependencies
3. Add integration tests in `src/test/integration/` using the real composer
4. Test all HTTP methods, status codes, error cases, and edge cases

## File Naming Conventions

This project follows **kebab-case** naming for all TypeScript files:

- **Entities**: `user.ts` (matches class name `User`)
- **Services**: `user.service.ts` 
- **Routes**: `users.ts` (plural for REST endpoints)
- **Tests**: `user.service.test.ts`, `user.test.ts`
- **Utilities**: `data-source.ts`

Examples:
- ✅ `src/entities/user.ts`
- ✅ `src/services/user.service.ts`
- ✅ `src/test/unit/user.service.test.ts`
- ❌ `src/entities/User.ts`
- ❌ `src/services/UserService.ts`
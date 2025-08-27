# Express TypeORM Starter

A modern Node.js REST API starter with a flexible database setup that supports both PGlite (embedded PostgreSQL) and full PostgreSQL, designed for optimal developer experience across different environments.

## 🌟 Features

- **Flexible Database Configuration**: Seamlessly switch between PGlite and PostgreSQL
- **Environment-Optimized**: 
  - Development: File-based PGlite with persistent state
  - Testing: In-memory PGlite for fast, isolated tests
  - Production: Full PostgreSQL
- **Modern Stack**: TypeScript, Express, TypeORM
- **Zero Setup**: Works out of the box without PostgreSQL installation
- **Smart Fixtures**: Automatically loads development data on first run
- **Type-Safe**: Full TypeScript coverage with proper entity definitions

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run all validation checks (recommended first step)
npm run ci

# Start development server (uses file-based PGlite)
npm run dev

# Start with fresh database and fixtures
npm run dev:fresh

# Use full PostgreSQL in development
npm run dev:postgres

# Run tests (uses in-memory PGlite)
npm test
```

## 📁 Project Structure

```
src/
├── config/
│   └── database.ts          # Database configuration logic
├── database/
│   ├── index.ts             # Database connection management
│   ├── dataSource.ts        # TypeORM DataSource factory
│   ├── initialization.ts    # Smart database initialization
│   └── fixtures.ts          # Development fixtures
├── entities/
│   └── User.ts              # TypeORM entities
├── routes/
│   └── users.ts             # API route handlers
├── services/
│   └── UserService.ts       # Business logic and pure functions
├── test/
│   ├── unit/                # Unit tests (business logic)
│   │   └── UserService.test.ts
│   └── integration/         # Integration tests (full stack)
│       ├── setup.ts         # Test database setup
│       └── user.test.ts     # API endpoint tests
└── server.ts                # Express server setup
```

## 🗄️ Database Modes

### Development (Default)
- Uses file-based PGlite (`./data/dev.db`)
- Persists data between restarts
- Automatically loads fixtures on first run
- Fast startup, no external dependencies

### Testing
- Uses in-memory PGlite
- Fresh database for each test
- Isolated and fast
- Fixtures loaded automatically

### Production
- Uses full PostgreSQL
- Configure via `DATABASE_URL` environment variable
- Migrations and proper schema management

## 🔧 Environment Variables

```bash
# Database configuration
NODE_ENV=development|test|production
DATABASE_TYPE=postgres          # Force PostgreSQL in any environment
DATABASE_URL=postgresql://...   # PostgreSQL connection string
FORCE_FIXTURES=true            # Load fixtures even with existing data

# Server configuration
PORT=3000
```

## 📡 API Endpoints

### Users API (`/api/users`)

- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### System Endpoints

- `GET /` - API information
- `GET /health` - Health check with database status

## 🧪 Testing & Validation

The project uses a clear separation between unit and integration tests:

```bash
# Run complete validation suite (TypeScript, linting, formatting, tests)
npm run ci

# Unit tests (fast, pure business logic)
npm run test:unit              # Run unit tests once
npm run test:watch:unit        # Unit tests in watch mode

# Integration tests (slower, full stack with database)
npm run test:integration       # Run integration tests once
npm run test:watch:integration # Integration tests in watch mode

# All tests
npm test              # Run all tests (unit + integration)
npm run test:watch    # All tests in watch mode
npm run test:coverage # All tests with coverage

# Individual validation steps
npm run typecheck     # TypeScript compilation check
npm run lint         # Code quality check
npm run format:check # Code formatting check
```

**Unit Tests** (`src/test/unit/`) test business logic without external dependencies. **Integration Tests** (`src/test/integration/`) test the full HTTP → Route → Database stack using in-memory PGlite.

## 🏗️ Development Workflow

### Starting Fresh
```bash
# Remove existing database and start clean
npm run dev:fresh
```

### Switching to PostgreSQL
```bash
# Use real PostgreSQL (must be running locally)
npm run dev:postgres

# Use PostgreSQL with fresh fixtures
npm run dev:postgres:fresh
```

### Normal Development
```bash
# Regular development (preserves your data)
npm run dev
```

## 📊 Database Features

### Smart Initialization
- **File doesn't exist**: Creates database with fixtures
- **File exists**: Uses existing data, runs any pending migrations
- **Explicit fixtures**: Use `FORCE_FIXTURES=true` to reload

### Fixture Management
Development fixtures include sample users:
- John Doe (john@example.com)
- Jane Smith (jane@example.com)
- Bob Johnson (bob@example.com)

Fixtures are loaded automatically in:
- New development databases
- All test environments
- When `FORCE_FIXTURES=true`

## 🔄 Migration Strategy

### Development
- Uses TypeORM's `synchronize: true` for rapid iteration
- Schema changes are applied automatically

### Production
- Disable synchronization
- Use proper migration files
- Run migrations with `npm run migration:run`

## 🏢 Production Deployment

### Environment Setup
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
```

### Build and Deploy
```bash
npm run build
npm start
```

## 🔧 Extending the Project

### Adding New Entities
1. Create entity in `src/entities/`
2. Add to `dataSource.ts` entities array
3. Update fixtures if needed
4. Add routes in `src/routes/`

### Custom Database Logic
- Modify `src/config/database.ts` for configuration
- Extend `src/database/initialization.ts` for setup logic
- Add migrations in `src/migrations/` for production

## 🤝 Development Tips

### Quick Commands Reference
```bash
# Development
npm run dev           # Standard development
npm run dev:fresh     # Reset database
npm run dev:postgres  # Use real PostgreSQL

# Validation & Testing
npm run ci                     # Run all checks (recommended)
npm test                      # Run all tests (unit + integration)
npm run test:unit             # Run unit tests only (fast)
npm run test:integration      # Run integration tests only
npm run test:watch            # All tests in watch mode
npm run test:watch:unit       # Unit tests in watch mode
npm run test:watch:integration # Integration tests in watch mode

# Production
npm run build       # Build for production
npm start          # Start production server

# Database Management  
npm run db:reset    # Reset database completely
npm run db:seed     # Load fixtures into existing DB

# Utilities
npm run clean       # Remove build artifacts
npm run reset       # Clean reinstall
```

### Debugging Database Issues
- Check `/health` endpoint for connection status
- Look for database files in `./data/` directory
- Use `DATABASE_TYPE=postgres` to test with real PostgreSQL

### Performance Notes
- **PGlite**: Slower than native PostgreSQL but zero setup
- **File-based**: Faster startup than PostgreSQL for development
- **In-memory**: Fastest for testing, no persistence

## 📝 License

MIT License - feel free to use this as a starting point for your projects!

## 🙋‍♂️ Need Help?

- Check the `/health` endpoint for system status
- Review the console output for initialization details
- Ensure all dependencies are installed with `npm install`
- For PostgreSQL mode, verify your database is running and accessible
export interface DatabaseConfig {
  type: 'postgres' | 'pglite-memory' | 'pglite-file';
  url?: string;
  path?: string;
  shouldLoadFixtures?: boolean;
}

export function getDatabaseConfig(): DatabaseConfig {
  const env = process.env.NODE_ENV || 'development';
  const dbType = process.env.DATABASE_TYPE;
  const forceFixtures = process.env.FORCE_FIXTURES === 'true';

  // Test environment - always in-memory for isolation
  if (env === 'test') {
    return {
      type: 'pglite-memory',
      shouldLoadFixtures: true
    };
  }

  // Explicit override for full postgres in dev
  if (dbType === 'postgres') {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/myapp_dev',
      shouldLoadFixtures: forceFixtures
    };
  }

  // Development default - file-based PGlite with fixtures
  if (env === 'development') {
    return {
      type: 'pglite-file',
      path: './data/dev.db'
    };
  }

  // Production - always full postgres
  return {
    type: 'postgres',
    url: process.env.DATABASE_URL!
  };
}

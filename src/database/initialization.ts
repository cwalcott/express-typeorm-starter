import { DataSource } from 'typeorm';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseConfig } from '../config/database.js';
import { loadFixtures } from './fixtures.js';
import { User } from '../entities/user.js';

export async function initializeDatabase(
  dataSource: DataSource,
  config: DatabaseConfig
): Promise<void> {
  await dataSource.initialize();
  console.log('🗃️  Database connection established');

  if (config.type === 'pglite-file') {
    await handleFileBasedDatabase(dataSource, config.path!);
  } else if (config.type === 'pglite-memory' || config.shouldLoadFixtures) {
    // Always load fixtures for in-memory databases or when explicitly requested
    await loadFixtures(dataSource);
  } else if (config.type === 'postgres' && process.env.NODE_ENV === 'development') {
    // For development with real postgres, run migrations but don't force fixtures
    const pendingMigrations = await dataSource.showMigrations();
    if (pendingMigrations) {
      console.log('🔄 Running pending migrations...');
      await dataSource.runMigrations();
    }
  }
}

async function handleFileBasedDatabase(dataSource: DataSource, dbPath: string): Promise<void> {
  const dbDirExists = existsSync(dbPath);

  // Check if database is empty by counting users
  const userRepo = dataSource.getRepository(User);
  const userCount = await userRepo.count();
  const isEmpty = userCount === 0;

  if (!dbDirExists || isEmpty) {
    if (!dbDirExists) {
      // Ensure directory exists
      mkdirSync(dirname(dbPath), { recursive: true });
    }

    console.log('🗃️  Creating new development database with fixtures...');

    // For PGlite, synchronize handles schema creation
    // In production with real migrations, you'd run them here instead

    // Load initial fixtures
    await loadFixtures(dataSource);

    console.log('✅ Development database initialized');
  } else {
    console.log('📁 Using existing development database');

    // Note: PGlite with synchronize will handle schema changes automatically
    // In a production setup with migrations, you'd check and run pending migrations here
  }
}

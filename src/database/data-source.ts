import { DataSource, LogLevel } from 'typeorm';
import { PGliteDriver } from 'typeorm-pglite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseConfig, getDatabaseConfig } from '../config/database.js';
import { User } from '../entities/user.js';

export async function createDataSource(config?: DatabaseConfig): Promise<DataSource> {
  const dbConfig = config || getDatabaseConfig();

  const baseConfig = {
    entities: [User],
    migrations: ['src/migrations/*.ts'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development' ? (['error', 'warn'] as LogLevel[]) : false
  };

  let dataSource: DataSource;

  switch (dbConfig.type) {
    case 'postgres':
      dataSource = new DataSource({
        type: 'postgres',
        url: dbConfig.url,
        ...baseConfig
      });
      break;

    case 'pglite-memory':
      dataSource = new DataSource({
        type: 'postgres',
        driver: new PGliteDriver().driver,
        ...baseConfig
      });
      break;

    case 'pglite-file':
      // Ensure directory exists before creating PGliteDriver
      mkdirSync(dirname(dbConfig.path!), { recursive: true });
      dataSource = new DataSource({
        type: 'postgres',
        driver: new PGliteDriver({ dataDir: dbConfig.path }).driver,
        ...baseConfig
      });
      break;

    default:
      throw new Error(`Unsupported database type: ${(dbConfig as { type: string }).type}`);
  }

  return dataSource;
}

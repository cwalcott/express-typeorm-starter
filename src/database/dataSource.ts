import { DataSource } from 'typeorm';
import { PGliteDriver } from 'typeorm-pglite';
import { DatabaseConfig, getDatabaseConfig } from '../config/database';
import { User } from '../entities/User';

export async function createDataSource(config?: DatabaseConfig): Promise<DataSource> {
  const dbConfig = config || getDatabaseConfig();

  const baseConfig = {
    entities: [User],
    migrations: ['src/migrations/*.ts'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
  };

  let dataSource: DataSource;

  switch (dbConfig.type) {
    case 'postgres':
      dataSource = new DataSource({
        type: 'postgres',
        url: dbConfig.url,
        ...baseConfig,
      });
      break;

    case 'pglite-memory':
      dataSource = new DataSource({
        type: 'postgres',
        driver: new PGliteDriver().driver,
        ...baseConfig,
      });
      break;

    case 'pglite-file':
      dataSource = new DataSource({
        type: 'postgres',
        driver: new PGliteDriver(dbConfig.path).driver,
        ...baseConfig,
      });
      break;

    default:
      throw new Error(`Unsupported database type: ${(dbConfig as any).type}`);
  }

  return dataSource;
}

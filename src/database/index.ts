import { DataSource } from 'typeorm';
import { createDataSource } from './data-source.js';
import { initializeDatabase } from './initialization.js';
import { getDatabaseConfig } from '../config/database.js';

let dataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (!dataSource) {
    const config = getDatabaseConfig();
    dataSource = createDataSource(config);
    await initializeDatabase(dataSource, config);
  }

  return dataSource;
}

export async function closeDatabase(): Promise<void> {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
    dataSource = null;
    console.log('🔌 Database connection closed');
  }
}

// Export for testing
export { createDataSource } from './data-source.js';
export { loadFixtures } from './fixtures.js';

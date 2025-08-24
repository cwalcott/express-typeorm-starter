import { DataSource } from 'typeorm';
import { createDataSource } from './dataSource';
import { initializeDatabase } from './initialization';
import { getDatabaseConfig } from '../config/database';

let dataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (!dataSource) {
    const config = getDatabaseConfig();
    dataSource = await createDataSource(config);
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
export { createDataSource } from './dataSource';
export { loadFixtures } from './fixtures';

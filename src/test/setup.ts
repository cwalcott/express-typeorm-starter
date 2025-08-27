import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { createDataSource, loadFixtures } from '../database/index.js';

export async function setupTestDB(): Promise<DataSource> {
  const dataSource = await createDataSource({ type: 'pglite-memory' });
  await dataSource.initialize();
  await loadFixtures(dataSource);
  return dataSource;
}

export async function cleanupTestDB(dataSource: DataSource): Promise<void> {
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
}

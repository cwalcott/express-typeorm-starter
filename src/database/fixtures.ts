import { DataSource } from 'typeorm';
import { User } from '../entities/User';

export async function loadFixtures(dataSource: DataSource): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Attempted to load fixtures in production environment');
    return;
  }

  console.log('📋 Loading development fixtures...');

  try {
    const userRepo = dataSource.getRepository(User);

    // Use upsert to be migration-friendly
    const fixtures = [
      { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
    ];

    for (const fixture of fixtures) {
      await userRepo.save(fixture);
    }

    console.log(`✅ Loaded ${fixtures.length} user fixtures`);
  } catch (error) {
    console.warn('⚠️  Could not load fixtures:', (error as Error).message);
  }
}

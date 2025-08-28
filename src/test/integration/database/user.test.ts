import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DataSource } from 'typeorm';
import { setupTestDB, cleanupTestDB } from '../setup.js';
import { User } from '../../../entities/user.js';

describe('User Entity', () => {
  let dataSource: DataSource;

  beforeEach(async () => {
    dataSource = await setupTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB(dataSource);
  });

  it('should create a new user', async () => {
    const userRepo = dataSource.getRepository(User);

    const user = userRepo.create({
      name: 'Test User',
      email: 'test@example.com',
      age: 28
    });

    const savedUser = await userRepo.save(user);

    expect(savedUser.id).toBeDefined();
    expect(savedUser.name).toBe('Test User');
    expect(savedUser.email).toBe('test@example.com');
    expect(savedUser.age).toBe(28);
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
  });

  it('should find existing fixture users', async () => {
    const userRepo = dataSource.getRepository(User);
    const users = await userRepo.find();

    expect(users.length).toBeGreaterThan(0);

    const johnDoe = users.find((u) => u.email === 'john@example.com');
    expect(johnDoe).toBeDefined();
    expect(johnDoe?.name).toBe('John Doe');
  });

  it('should enforce unique email constraint', async () => {
    const userRepo = dataSource.getRepository(User);

    const user1 = userRepo.create({
      name: 'User 1',
      email: 'duplicate@example.com'
    });

    const user2 = userRepo.create({
      name: 'User 2',
      email: 'duplicate@example.com'
    });

    await userRepo.save(user1);

    // Should throw an error due to unique constraint
    await expect(userRepo.save(user2)).rejects.toThrow();
  });

  it('should update user timestamps', async () => {
    const userRepo = dataSource.getRepository(User);

    const user = userRepo.create({
      name: 'Update Test',
      email: 'update@example.com'
    });

    const savedUser = await userRepo.save(user);
    const originalUpdatedAt = savedUser.updatedAt;

    // Small delay to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 10));

    savedUser.name = 'Updated Name';
    const updatedUser = await userRepo.save(savedUser);

    expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});

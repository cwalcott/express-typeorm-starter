import { getDataSource } from '../database/index.js';
import { User } from '../entities/user.js';

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; statusCode: number };

export class UserService {
  /**
   * Get all users
   */
  static async getAllUsers(): Promise<ServiceResult<User[]>> {
    try {
      const dataSource = await getDataSource();
      const userRepo = dataSource.getRepository(User);
      const users = await userRepo.find({ order: { createdAt: 'DESC' } });

      return { success: true, data: users };
    } catch {
      return {
        success: false,
        error: 'Failed to fetch users',
        statusCode: 500
      };
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: number): Promise<ServiceResult<User>> {
    try {
      const dataSource = await getDataSource();
      const userRepo = dataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id } });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          statusCode: 404
        };
      }

      return { success: true, data: user };
    } catch {
      return {
        success: false,
        error: 'Failed to fetch user',
        statusCode: 500
      };
    }
  }

  /**
   * Create a new user
   */
  static async createUser(userData: {
    name: string;
    email: string;
    age?: number;
  }): Promise<ServiceResult<User>> {
    try {
      const dataSource = await getDataSource();
      const userRepo = dataSource.getRepository(User);

      const user = userRepo.create({
        name: userData.name, // Already sanitized by Zod
        email: userData.email, // Already normalized by Zod
        age: userData.age
      });

      const savedUser = await userRepo.save(user);
      return { success: true, data: savedUser };
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        return {
          success: false,
          error: 'Email already exists',
          statusCode: 400
        };
      }
      return {
        success: false,
        error: 'Failed to create user',
        statusCode: 500
      };
    }
  }

  /**
   * Update an existing user
   */
  static async updateUser(
    id: number,
    userData: { name?: string; email?: string; age?: number }
  ): Promise<ServiceResult<User>> {
    try {
      const dataSource = await getDataSource();
      const userRepo = dataSource.getRepository(User);

      const user = await userRepo.findOne({ where: { id } });
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          statusCode: 404
        };
      }

      if (userData.name !== undefined) {
        user.name = userData.name; // Already sanitized by Zod
      }
      if (userData.email !== undefined) {
        user.email = userData.email; // Already normalized by Zod
      }
      if (userData.age !== undefined) {
        user.age = userData.age;
      }

      const updatedUser = await userRepo.save(user);
      return { success: true, data: updatedUser };
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        return {
          success: false,
          error: 'Email already exists',
          statusCode: 400
        };
      }
      return {
        success: false,
        error: 'Failed to update user',
        statusCode: 500
      };
    }
  }

  /**
   * Delete a user
   */
  static async deleteUser(id: number): Promise<ServiceResult<void>> {
    try {
      const dataSource = await getDataSource();
      const userRepo = dataSource.getRepository(User);

      // Check if user exists first
      const user = await userRepo.findOne({ where: { id } });
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          statusCode: 404
        };
      }

      await userRepo.delete(id);
      return { success: true, data: undefined };
    } catch {
      return {
        success: false,
        error: 'Failed to delete user',
        statusCode: 500
      };
    }
  }
}

import { Repository } from 'typeorm';
import { User } from '../entities/user.js';

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; statusCode: number };

export class UserService {
  constructor(private readonly userRepository: Repository<User>) {}

  async getAllUsers(): Promise<ServiceResult<User[]>> {
    try {
      const users = await this.userRepository.find({ order: { createdAt: 'DESC' } });

      return { success: true, data: users };
    } catch {
      return {
        success: false,
        error: 'Failed to fetch users',
        statusCode: 500
      };
    }
  }

  async getUserById(id: number): Promise<ServiceResult<User>> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

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

  async createUser(userData: {
    name: string;
    email: string;
    age?: number;
  }): Promise<ServiceResult<User>> {
    try {
      const user = this.userRepository.create({
        name: userData.name, // Already sanitized by Zod
        email: userData.email, // Already normalized by Zod
        age: userData.age
      });

      const savedUser = await this.userRepository.save(user);
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

  async updateUser(
    id: number,
    userData: { name?: string; email?: string; age?: number }
  ): Promise<ServiceResult<User>> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
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

      const updatedUser = await this.userRepository.save(user);
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

  async deleteUser(id: number): Promise<ServiceResult<void>> {
    try {
      // Check if user exists first
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          statusCode: 404
        };
      }

      await this.userRepository.delete(id);
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

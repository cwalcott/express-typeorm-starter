import { Repository } from 'typeorm';
import { User } from '../entities/user.js';

type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

export class UserService {
  constructor(private readonly userRepository: Repository<User>) {}

  async getAllUsers(): Promise<Result<User[], 'database_error'>> {
    try {
      const users = await this.userRepository.find({ order: { createdAt: 'DESC' } });
      return { success: true, data: users };
    } catch {
      return { success: false, error: 'database_error' };
    }
  }

  async getUserById(id: number): Promise<Result<User, 'not_found' | 'database_error'>> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        return { success: false, error: 'not_found' };
      }

      return { success: true, data: user };
    } catch {
      return { success: false, error: 'database_error' };
    }
  }

  async createUser(userData: {
    name: string;
    email: string;
    age?: number;
  }): Promise<Result<User, 'email_exists' | 'database_error'>> {
    try {
      const user = this.userRepository.create({
        name: userData.name,
        email: userData.email,
        age: userData.age
      });

      const savedUser = await this.userRepository.save(user);
      return { success: true, data: savedUser };
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        return { success: false, error: 'email_exists' };
      }

      return { success: false, error: 'database_error' };
    }
  }

  async updateUser(
    id: number,
    userData: { name?: string; email?: string; age?: number }
  ): Promise<Result<User, 'email_exists' | 'not_found' | 'database_error'>> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return { success: false, error: 'not_found' };
      }

      if (userData.name !== undefined) {
        user.name = userData.name;
      }
      if (userData.email !== undefined) {
        user.email = userData.email;
      }
      if (userData.age !== undefined) {
        user.age = userData.age;
      }

      const updatedUser = await this.userRepository.save(user);
      return { success: true, data: updatedUser };
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        return { success: false, error: 'email_exists' };
      }

      return { success: false, error: 'database_error' };
    }
  }

  async deleteUser(id: number): Promise<Result<void, 'not_found' | 'database_error'>> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return { success: false, error: 'not_found' };
      }

      await this.userRepository.delete(id);
      return { success: true, data: undefined };
    } catch {
      return { success: false, error: 'database_error' };
    }
  }
}

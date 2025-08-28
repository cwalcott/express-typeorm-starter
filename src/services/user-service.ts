import { getDataSource } from '../database/index.js';
import { User } from '../entities/user.js';

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; statusCode: number };

export class UserService {
  /**
   * Validates email format using a simple regex
   */
  static validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Validates age is within reasonable bounds
   */
  static validateAge(age: number): boolean {
    if (typeof age !== 'number' || isNaN(age)) {
      return false;
    }

    return age >= 0 && age <= 150;
  }

  /**
   * Sanitizes name by trimming whitespace and capitalizing first letter of each word
   */
  static sanitizeName(name: string): string {
    if (!name || typeof name !== 'string') {
      return '';
    }

    return name
      .trim()
      .split(' ')
      .filter((word) => word.length > 0)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Validates complete user data
   */
  static validateUser(userData: { name: string; email: string; age?: number }): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!userData.name || typeof userData.name !== 'string') {
      errors.push('Name is required');
    } else {
      const sanitizedName = this.sanitizeName(userData.name);
      if (!sanitizedName) {
        errors.push('Name is required');
      }
    }

    if (!userData.email || typeof userData.email !== 'string') {
      errors.push('Email is required');
    } else if (!this.validateEmail(userData.email)) {
      errors.push('Invalid email format');
    }

    if (userData.age !== undefined && !this.validateAge(userData.age)) {
      errors.push('Age must be between 0 and 150');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

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
      if (!id || isNaN(id)) {
        return {
          success: false,
          error: 'Invalid user ID',
          statusCode: 400
        };
      }

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
      const validation = this.validateUser(userData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          statusCode: 400
        };
      }

      const dataSource = await getDataSource();
      const userRepo = dataSource.getRepository(User);

      const sanitizedName = this.sanitizeName(userData.name);
      const user = userRepo.create({
        name: sanitizedName,
        email: userData.email.trim().toLowerCase(),
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
      if (!id || isNaN(id)) {
        return {
          success: false,
          error: 'Invalid user ID',
          statusCode: 400
        };
      }

      // Validate each field individually for updates
      const errors: string[] = [];

      if (userData.name !== undefined) {
        if (!userData.name || typeof userData.name !== 'string') {
          errors.push('Name is required');
        } else {
          const sanitizedName = this.sanitizeName(userData.name);
          if (!sanitizedName) {
            errors.push('Name is required');
          }
        }
      }

      if (userData.email !== undefined) {
        if (!userData.email || typeof userData.email !== 'string') {
          errors.push('Email is required');
        } else if (!this.validateEmail(userData.email)) {
          errors.push('Invalid email format');
        }
      }

      if (userData.age !== undefined && !this.validateAge(userData.age)) {
        errors.push('Age must be between 0 and 150');
      }

      if (errors.length > 0) {
        return {
          success: false,
          error: errors.join(', '),
          statusCode: 400
        };
      }

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
        user.name = this.sanitizeName(userData.name);
      }
      if (userData.email !== undefined) {
        user.email = userData.email.trim().toLowerCase();
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
      if (!id || isNaN(id)) {
        return {
          success: false,
          error: 'Invalid user ID',
          statusCode: 400
        };
      }

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

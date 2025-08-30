import { describe, it, expect } from 'vitest';
import { UserService } from '../../services/user.service.js';
import { User } from '../../entities/user.js';

describe('UserService', () => {
  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    } as User,
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      createdAt: new Date(0),
      updatedAt: new Date()
    } as User
  ];

  describe('#getAllUsers', () => {
    describe('success', () => {
      it('should return all users', async () => {
        const userService = new UserService({ find: async () => users } as any);

        const result = await userService.getAllUsers();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(users);
        }
      });
    });

    describe('failure', () => {
      it('should handle repository errors gracefully', async () => {
        const userService = new UserService({
          find: async () => {
            throw new Error('DB error');
          }
        } as any);

        const result = await userService.getAllUsers();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('database_error');
        }
      });
    });
  });

  describe('#getUserById', () => {
    const user = users[0];

    describe('success', () => {
      it('should return user when found', async () => {
        const userService = new UserService({
          findOne: async ({ where: { id } }: { where: { id: number } }) => {
            return id === user.id ? user : null;
          }
        } as any);

        const result = await userService.getUserById(user.id);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(user);
        }
      });
    });

    describe('not found', () => {
      it('should return 404 when user not found', async () => {
        const userService = new UserService({ findOne: async () => null } as any);

        const result = await userService.getUserById(999);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('not_found');
        }
      });
    });

    describe('failure', () => {
      it('should handle repository errors gracefully', async () => {
        const userService = new UserService({
          findOne: async () => {
            throw new Error('DB error');
          }
        } as any);

        const result = await userService.getUserById(1);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('database_error');
        }
      });
    });
  });

  describe('#createUser', () => {
    const userData = {
      name: 'New User',
      email: 'new@example.com',
      age: 25
    };

    describe('success', () => {
      it('should create and return new user', async () => {
        const userService = new UserService({
          create: (data: any) => data,
          save: async (user: any) => ({
            ...user,
            id: 3,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        } as any);

        const result = await userService.createUser(userData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe(userData.name);
          expect(result.data.email).toBe(userData.email);
          expect(result.data.age).toBe(userData.age);
          expect(result.data.id).toBe(3);
        }
      });
    });

    describe('duplicate email error', () => {
      it('should return 400 when email already exists', async () => {
        const userService = new UserService({
          create: (data: any) => data,
          save: async () => {
            const error = new Error('Duplicate key') as any;
            error.code = '23505';
            throw error;
          }
        } as any);

        const result = await userService.createUser(userData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('email_exists');
        }
      });
    });

    describe('failure', () => {
      it('should handle repository errors gracefully', async () => {
        const userService = new UserService({
          create: (data: any) => data,
          save: async () => {
            throw new Error('DB error');
          }
        } as any);

        const result = await userService.createUser(userData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('database_error');
        }
      });
    });
  });

  describe('#updateUser', () => {
    const existingUser = users[0];
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com'
    };

    describe('success', () => {
      it('should update and return user when found', async () => {
        const userService = new UserService({
          findOne: async ({ where: { id } }: { where: { id: number } }) => {
            return id === existingUser.id ? { ...existingUser } : null;
          },
          save: async (user: any) => ({ ...user, updatedAt: new Date() })
        } as any);

        const result = await userService.updateUser(existingUser.id, updateData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe(updateData.name);
          expect(result.data.email).toBe(updateData.email);
          expect(result.data.id).toBe(existingUser.id);
        }
      });

      it('should handle partial updates', async () => {
        const userService = new UserService({
          findOne: async ({ where: { id } }: { where: { id: number } }) => {
            return id === existingUser.id ? { ...existingUser } : null;
          },
          save: async (user: any) => ({ ...user, updatedAt: new Date() })
        } as any);

        const result = await userService.updateUser(existingUser.id, { name: 'Only Name' });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe('Only Name');
          expect(result.data.email).toBe(existingUser.email); // Unchanged
        }
      });
    });

    describe('not found', () => {
      it('should return 404 when user not found', async () => {
        const userService = new UserService({
          findOne: async () => null
        } as any);

        const result = await userService.updateUser(999, updateData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('not_found');
        }
      });
    });

    describe('duplicate email error', () => {
      it('should return 400 when email already exists', async () => {
        const userService = new UserService({
          findOne: async ({ where: { id } }: { where: { id: number } }) => {
            return id === existingUser.id ? { ...existingUser } : null;
          },
          save: async () => {
            const error = new Error('Duplicate key') as any;
            error.code = '23505';
            throw error;
          }
        } as any);

        const result = await userService.updateUser(existingUser.id, updateData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('email_exists');
        }
      });
    });

    describe('failure', () => {
      it('should handle repository errors gracefully', async () => {
        const userService = new UserService({
          findOne: async ({ where: { id } }: { where: { id: number } }) => {
            return id === existingUser.id ? { ...existingUser } : null;
          },
          save: async () => {
            throw new Error('DB error');
          }
        } as any);

        const result = await userService.updateUser(existingUser.id, updateData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('database_error');
        }
      });
    });
  });

  describe('#deleteUser', () => {
    const existingUser = users[0];

    describe('success', () => {
      it('should delete user when found', async () => {
        const userService = new UserService({
          findOne: async ({ where: { id } }: { where: { id: number } }) => {
            return id === existingUser.id ? { ...existingUser } : null;
          },
          delete: async () => {}
        } as any);

        const result = await userService.deleteUser(existingUser.id);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBeUndefined();
        }
      });
    });

    describe('not found', () => {
      it('should return 404 when user not found', async () => {
        const userService = new UserService({
          findOne: async () => null
        } as any);

        const result = await userService.deleteUser(999);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('not_found');
        }
      });
    });

    describe('failure', () => {
      it('should handle repository errors gracefully', async () => {
        const userService = new UserService({
          findOne: async ({ where: { id } }: { where: { id: number } }) => {
            return id === existingUser.id ? { ...existingUser } : null;
          },
          delete: async () => {
            throw new Error('DB error');
          }
        } as any);

        const result = await userService.deleteUser(existingUser.id);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('database_error');
        }
      });
    });
  });
});

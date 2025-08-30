import { Request, Router } from 'express';
import { UserService } from '../services/user.service.js';
import { UserSchema } from '../validators/user-validators.js';
import { handleApiResponse } from './api.js';

export function usersRouter(userService: UserService): Router {
  const router = Router();

  // GET /users - List all users
  router.get(
    '/',
    handleApiResponse(async () => {
      const result = await userService.getAllUsers();

      if (result.success) {
        return { success: true, status: 200, data: result.data };
      } else {
        return { success: false, status: 500, error: 'Failed to fetch users' };
      }
    })
  );

  // GET /users/:id - Get user by ID
  router.get(
    '/:id',
    handleApiResponse(async (req: Request) => {
      const id = parseInt(req.params.id);
      if (!id || isNaN(id)) {
        return { success: false, status: 400, error: 'Invalid user ID' };
      }

      const result = await userService.getUserById(id);

      if (result.success) {
        return { success: true, status: 200, data: result.data };
      } else {
        switch (result.error) {
          case 'not_found':
            return { success: false, status: 404, error: 'User not found' };
          case 'database_error':
            return { success: false, status: 500, error: 'Failed to fetch user' };
        }
      }
    })
  );

  // POST /users - Create new user
  router.post(
    '/',
    handleApiResponse(async (req: Request) => {
      const parsed = UserSchema.safeParse(req.body);
      if (!parsed.success) {
        return { success: false, status: 400, error: parsed.error.issues[0].message };
      }

      const result = await userService.createUser(parsed.data);
      if (result.success) {
        return { success: true, status: 201, data: result.data };
      } else {
        switch (result.error) {
          case 'email_exists':
            return { success: false, status: 400, error: 'Email already exists' };
          case 'database_error':
            return { success: false, status: 500, error: 'Failed to create user' };
        }
      }
    })
  );

  // PUT /users/:id - Update user
  router.put(
    '/:id',
    handleApiResponse(async (req: Request) => {
      const id = parseInt(req.params.id);
      if (!id || isNaN(id)) {
        return { success: false, status: 400, error: 'Invalid user ID' };
      }

      const parsed = UserSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return { success: false, status: 400, error: parsed.error.issues[0].message };
      }

      const result = await userService.updateUser(id, parsed.data);
      if (result.success) {
        return { success: true, status: 200, data: result.data };
      } else {
        switch (result.error) {
          case 'email_exists':
            return { success: false, status: 400, error: 'Email already exists' };
          case 'not_found':
            return { success: false, status: 404, error: 'User not found' };
          case 'database_error':
            return { success: false, status: 500, error: 'Failed to update user' };
        }
      }
    })
  );

  // DELETE /users/:id - Delete user
  router.delete(
    '/:id',
    handleApiResponse(async (req: Request) => {
      const id = parseInt(req.params.id);
      if (!id || isNaN(id)) {
        return { success: false, status: 400, error: 'Invalid user ID' };
      }

      const result = await userService.deleteUser(id);
      if (result.success) {
        return { success: true, status: 204 };
      } else {
        switch (result.error) {
          case 'not_found':
            return { success: false, status: 404, error: 'User not found' };
          case 'database_error':
            return { success: false, status: 500, error: 'Failed to delete user' };
        }
      }
    })
  );

  return router;
}

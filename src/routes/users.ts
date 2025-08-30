import { Router, Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import { UserSchema } from '../validators/user-validators.js';

export function usersRouter(userService: UserService): Router {
  const router = Router();

  // GET /users - List all users
  router.get('/', async (_req: Request, res: Response) => {
    const result = await userService.getAllUsers();

    if (result.success) {
      res.json(result.data);
    } else if (result.error === 'database_error') {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // GET /users/:id - Get user by ID
  router.get('/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (!id || isNaN(id)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const result = await userService.getUserById(id);

    if (result.success) {
      res.json(result.data);
    } else if (result.error === 'not_found') {
      res.status(404).json({ error: 'User not found' });
    } else if (result.error === 'database_error') {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // POST /users - Create new user
  router.post('/', async (req, res) => {
    const parsed = UserSchema.safeParse(req.body);
    if (parsed.success) {
      const { name, email, age } = parsed.data;
      const result = await userService.createUser({ name, email, age });

      if (result.success) {
        res.status(201).json(result.data);
      } else if (result.error === 'email_exists') {
        res.status(400).json({ error: 'Email already exists' });
      } else if (result.error === 'database_error') {
        res.status(500).json({ error: 'Failed to create user' });
      }
    } else {
      res.status(400).json({ error: parsed.error.issues[0].message });
    }
  });

  // PUT /users/:id - Update user
  router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    if (!id || isNaN(id)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const parsed = UserSchema.partial().safeParse(req.body);
    if (parsed.success) {
      const { name, email, age } = parsed.data;
      const result = await userService.updateUser(id, { name, email, age });

      if (result.success) {
        res.json(result.data);
      } else if (result.error === 'email_exists') {
        res.status(400).json({ error: 'Email already exists' });
      } else if (result.error === 'not_found') {
        res.status(404).json({ error: 'User not found' });
      } else if (result.error === 'database_error') {
        res.status(500).json({ error: 'Failed to update user' });
      }
    } else {
      res.status(400).json({ error: parsed.error.issues[0].message });
    }
  });

  // DELETE /users/:id - Delete user
  router.delete('/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (!id || isNaN(id)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const result = await userService.deleteUser(id);

    if (result.success) {
      res.status(204).send();
    } else if (result.error === 'not_found') {
      res.status(404).json({ error: 'User not found' });
    } else if (result.error === 'database_error') {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  return router;
}

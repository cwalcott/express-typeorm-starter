import { Router, Request, Response } from 'express';
import { UserService } from '../services/user-service.js';
import { UserSchema } from '../validators/user-validators.js';

const router = Router();

// GET /users - List all users
router.get('/', async (_req: Request, res: Response) => {
  const result = await UserService.getAllUsers();

  if (result.success) {
    res.json(result.data);
  } else {
    res.status(result.statusCode).json({ error: result.error });
  }
});

// GET /users/:id - Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (!id || isNaN(id)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  const result = await UserService.getUserById(id);

  if (result.success) {
    res.json(result.data);
  } else {
    res.status(result.statusCode).json({ error: result.error });
  }
});

// POST /users - Create new user
router.post('/', async (req, res) => {
  const parsed = UserSchema.safeParse(req.body);
  if (parsed.success) {
    const { name, email, age } = parsed.data;
    const result = await UserService.createUser({ name, email, age });

    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(result.statusCode).json({ error: result.error });
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
    const result = await UserService.updateUser(id, { name, email, age });

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(result.statusCode).json({ error: result.error });
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

  const result = await UserService.deleteUser(id);

  if (result.success) {
    res.status(204).send();
  } else {
    res.status(result.statusCode).json({ error: result.error });
  }
});

export { router as usersRouter };

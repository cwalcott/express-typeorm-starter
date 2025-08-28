import { Router, Request, Response } from 'express';
import { UserService } from '../services/user-service.js';

const router = Router();

// GET /users - List all users
router.get('/', async (req: Request, res: Response) => {
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
  const result = await UserService.getUserById(id);

  if (result.success) {
    res.json(result.data);
  } else {
    res.status(result.statusCode).json({ error: result.error });
  }
});

// POST /users - Create new user
router.post('/', async (req: Request, res: Response) => {
  const { name, email, age } = req.body;
  const result = await UserService.createUser({ name, email, age });

  if (result.success) {
    res.status(201).json(result.data);
  } else {
    res.status(result.statusCode).json({ error: result.error });
  }
});

// PUT /users/:id - Update user
router.put('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, email, age } = req.body;
  const result = await UserService.updateUser(id, { name, email, age });

  if (result.success) {
    res.json(result.data);
  } else {
    res.status(result.statusCode).json({ error: result.error });
  }
});

// DELETE /users/:id - Delete user
router.delete('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const result = await UserService.deleteUser(id);

  if (result.success) {
    res.status(204).send();
  } else {
    res.status(result.statusCode).json({ error: result.error });
  }
});

export { router as usersRouter };

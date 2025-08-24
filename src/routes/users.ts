import { Router, Request, Response } from 'express'
import { getDataSource } from '../database'
import { User } from '../entities/User'

const router = Router()

// GET /users - List all users
router.get('/', async (req: Request, res: Response) => {
  try {
    const dataSource = await getDataSource()
    const userRepo = dataSource.getRepository(User)
    const users = await userRepo.find({
      order: { createdAt: 'DESC' }
    })
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// GET /users/:id - Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const dataSource = await getDataSource()
    const userRepo = dataSource.getRepository(User)
    const user = await userRepo.findOne({
      where: { id: parseInt(req.params.id) }
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// POST /users - Create new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, age } = req.body
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' })
    }
    
    const dataSource = await getDataSource()
    const userRepo = dataSource.getRepository(User)
    
    const user = userRepo.create({ name, email, age })
    const savedUser = await userRepo.save(user)
    
    res.status(201).json(savedUser)
  } catch (error) {
    if ((error as any).code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Email already exists' })
    } else {
      res.status(500).json({ error: 'Failed to create user' })
    }
  }
})

// PUT /users/:id - Update user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, email, age } = req.body
    const userId = parseInt(req.params.id)
    
    const dataSource = await getDataSource()
    const userRepo = dataSource.getRepository(User)
    
    const user = await userRepo.findOne({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    if (name !== undefined) user.name = name
    if (email !== undefined) user.email = email
    if (age !== undefined) user.age = age
    
    const updatedUser = await userRepo.save(user)
    res.json(updatedUser)
  } catch (error) {
    if ((error as any).code === '23505') {
      res.status(400).json({ error: 'Email already exists' })
    } else {
      res.status(500).json({ error: 'Failed to update user' })
    }
  }
})

// DELETE /users/:id - Delete user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id)
    
    const dataSource = await getDataSource()
    const userRepo = dataSource.getRepository(User)
    
    const result = await userRepo.delete(userId)
    
    if (result.affected === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

export { router as usersRouter }
import 'reflect-metadata';
import express from 'express';
import { usersRouter } from '../../../routes/users.js';
import { healthRouter } from '../../../routes/health.js';
import { createLiveComposer } from '../../../di/composer.js';

export async function createTestApp(): Promise<express.Express> {
  const composer = await createLiveComposer();

  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.use(healthRouter);

  // API routes
  app.use('/api/users', usersRouter(composer.createUserService()));

  // Error handling
  app.use((_, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  app.use(
    (error: Error, _: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('Test app error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  );

  return app;
}

import { Router } from 'express';
import { getDataSource } from '../database/index.js';

const router = Router();

router.get('/health', async (_, res) => {
  try {
    const dataSource = await getDataSource();
    const isConnected = dataSource.isInitialized;

    res.json({
      status: 'ok',
      database: isConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'error',
      error: (error as Error).message
    });
  }
});

export { router as healthRouter };

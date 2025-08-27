import 'reflect-metadata';
import express from 'express';
import { getDataSource, closeDatabase } from './database/index.js';
import { usersRouter } from './routes/users.js';

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize database
  try {
    await getDataSource();
    console.log('🚀 Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }

  // Routes
  app.get('/', (_, res) => {
    res.json({
      message: 'Flexible Database API',
      endpoints: {
        users: '/api/users',
        health: '/health'
      }
    });
  });

  app.get('/health', async (_, res) => {
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

  // API routes
  app.use('/api/users', usersRouter);

  // Error handling
  app.use((_, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  app.use(
    (error: Error, _: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('Unhandled error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  );

  // Start server
  const server = app.listen(port, () => {
    console.log(`🌐 Server running on http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`👥 Users API: http://localhost:${port}/api/users`);
    console.log('🔄 Server is now listening for connections');
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  });

  process.on('SIGINT', async () => {
    console.log('\n🛑 SIGINT received, shutting down gracefully...');
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  });
}

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

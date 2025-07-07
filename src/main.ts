import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  // Get port from environment variable or default to 8000
  const port = process.env.PORT || 8000;

  // Create app with memory optimization
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'], // Reduce logging in production
  });

  // Enable CORS
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true); // allow Postman, curl, etc.
      const allowedOrigins = ['https://isaac-client.vercel.app'];
      const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(origin);
      const isSubdomain = /^https:\/\/[a-zA-Z0-9-]+\.isaac\.vercel.app$/.test(
        origin,
      );

      if (allowedOrigins.includes(origin) || isLocalhost || isSubdomain) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Listen on the specified port
  await app.listen(port, '0.0.0.0'); // Bind to all interfaces
  console.log(`Application is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

bootstrap().catch((err) => {
  console.error('Failed to start the application:', err);
  process.exit(1);
});

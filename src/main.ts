import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(3000);
  console.log(`Application is running on port 3000`);
}

bootstrap().catch((err) => {
  console.error('Failed to start the application:', err);
  process.exit(1);
});

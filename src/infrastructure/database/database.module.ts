import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<any> => {
        const uri = config.get<string>('MONGO_URI');
        const dbName = config.get<string>('MONGO_DB');

        if (!uri || !dbName) {
          throw new Error(
            'MONGO_URI and MONGO_DB must be defined in environment variables',
          );
        }
        const mongoose = await import('mongoose');
        mongoose.connection.on('error', (error) => {
          Logger.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('connected', () => {
          Logger.log('MongoDB connected successfully');
        });
        mongoose.connection.on('disconnected', () => {
          Logger.warn('MongoDB disconnected');
        });

        return {
          uri: uri,
          dbName: dbName,
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}

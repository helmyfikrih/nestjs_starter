import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SharedModule } from './modules/shared/shared.module';
import { AuthenticationGuard } from './modules/auth/guards/auth.guard';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import configuration from '../config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from 'src/database/data-source';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { HttpExceptionFilter } from './common/exception/http-exception.filter';
import { CommonModule } from './common/common.module';
import * as Joi from 'joi';

@Module({
  imports: [
    // Environment Configuration
    ConfigModule.forRoot({
      envFilePath: [`${process.cwd()}/.env.${process.env.NODE_ENV}`, `${process.cwd()}/.env`],
      isGlobal: true,
      load: [configuration],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_ENABLED: Joi.boolean().default(false),
        DB_HOST: Joi.string().when('DATABASE_ENABLED', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().when('DATABASE_ENABLED', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
        DB_PASSWORD: Joi.string().when('DATABASE_ENABLED', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
        DB_NAME: Joi.string().when('DATABASE_ENABLED', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().default('1h'),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
        THROTTLE_TTL: Joi.number().default(60),
        THROTTLE_LIMIT: Joi.number().default(10),
      }),
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [{
        ttl: config.get('THROTTLE_TTL'),
        limit: config.get('THROTTLE_LIMIT'),
      }],
    }),

    // Database - conditionally loaded
    ...conditionalImports(),

    // Common modules
    CommonModule,

    // Application Modules
    AuthModule,
    UserModule,
    SharedModule,
  ],
  providers: [
    // Global Guards
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Uncomment to apply authentication globally
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthenticationGuard,
    // },

    // Global Filters
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule { }

/**
 * Conditionally import modules based on configuration
 */
function conditionalImports() {
  // Check environment variable directly since the ConfigModule might not be initialized yet
  const databaseEnabled = process.env.DATABASE_ENABLED === 'true';

  return databaseEnabled ? [TypeOrmModule.forRootAsync(typeOrmAsyncConfig)] : [];
}
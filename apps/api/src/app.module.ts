import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { ThrottlerBehindProxyGuard } from './common/security/throttler-behind-proxy.guard';
import configuration, { type AppConfig } from './config/configuration';
import { DrizzleModule } from './database/drizzle.module';
import { HealthModule } from './health/health.module';
import { MessagesModule } from './messages/messages.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.development', '.env'],
      load: [configuration],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => [
        {
          name: 'default',
          ttl: configService.get('throttleTtlMs', { infer: true }),
          limit: configService.get('throttleLimit', { infer: true }),
        },
        {
          name: 'auth',
          ttl: configService.get('throttleAuthTtlMs', { infer: true }),
          limit: configService.get('throttleAuthLimit', { infer: true }),
        },
      ],
    }),
    DrizzleModule,
    HealthModule,
    AuthModule,
    MessagesModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule {}

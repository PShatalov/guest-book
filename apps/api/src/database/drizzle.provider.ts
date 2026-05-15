import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { AppConfig } from '../config/configuration';
import { DRIZZLE } from './drizzle.constants';
import * as schema from './schema';

const logger = new Logger('DrizzleDatabaseProvider');

export type DrizzleClient = ReturnType<typeof createDrizzleClient>;

function createDrizzleClient(pool: Pool) {
  return drizzle(pool, { schema });
}

export const drizzleProvider = {
  provide: DRIZZLE,
  inject: [ConfigService],
  useFactory: (configService: ConfigService<AppConfig, true>) => {
    const databaseUrl = configService.get('databaseUrl', { infer: true });

    if (!databaseUrl) {
      logger.warn(
        'DATABASE_URL is not set — Drizzle client unavailable until KAN-6',
      );
      return null;
    }

    const pool = new Pool({ connectionString: databaseUrl });
    return createDrizzleClient(pool);
  },
};

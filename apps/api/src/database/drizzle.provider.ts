import {
  Injectable,
  Logger,
  OnModuleDestroy,
  type Provider,
} from '@nestjs/common';
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

@Injectable()
export class DrizzleDatabaseProvider implements OnModuleDestroy {
  private pool: Pool | null = null;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  createClient(): DrizzleClient | null {
    const databaseUrl = this.configService.get('databaseUrl', { infer: true });

    if (!databaseUrl) {
      return null;
    }

    this.pool = new Pool({ connectionString: databaseUrl });
    return createDrizzleClient(this.pool);
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.pool) {
      return;
    }

    await this.pool.end();
    this.pool = null;
    logger.log('PostgreSQL connection pool closed');
  }
}

export const drizzleProvider: Provider = {
  provide: DRIZZLE,
  inject: [DrizzleDatabaseProvider],
  useFactory: (provider: DrizzleDatabaseProvider) => provider.createClient(),
};

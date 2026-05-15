import { Inject, Injectable, Logger } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE } from '../database/drizzle.constants';
import type { DrizzleClient } from '../database/drizzle.provider';

export type DatabaseProbeState = 'up' | 'down' | 'not_configured';

@Injectable()
export class DatabaseConnectivityProbe {
  private readonly logger = new Logger(DatabaseConnectivityProbe.name);

  constructor(
    @Inject(DRIZZLE) private readonly drizzle: DrizzleClient | null,
  ) {}

  async probe(): Promise<DatabaseProbeState> {
    if (!this.drizzle) {
      return 'not_configured';
    }

    try {
      await this.drizzle.execute(sql`SELECT 1`);
      return 'up';
    } catch (error) {
      this.logger.warn(
        'Database connectivity probe failed',
        error instanceof Error ? error.message : error,
      );
      return 'down';
    }
  }
}

import { Pool } from 'pg';

import { TEST_TABLES_TO_TRUNCATE } from './constants';

export class TestDatabaseCleaner {
  async truncateTables(
    databaseUrl: string,
    tableNames: readonly string[] = TEST_TABLES_TO_TRUNCATE,
  ): Promise<void> {
    if (tableNames.length === 0) {
      return;
    }

    const pool = new Pool({ connectionString: databaseUrl });

    try {
      for (const tableName of tableNames) {
        const exists = await pool.query<{ regclass: string | null }>(
          `SELECT to_regclass($1) AS regclass`,
          [`public.${tableName}`],
        );

        if (!exists.rows[0]?.regclass) {
          continue;
        }

        await pool.query(
          `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`,
        );
      }

      await this.refreshMessageFeedIfPresent(pool);
    } finally {
      await pool.end();
    }
  }

  private async refreshMessageFeedIfPresent(pool: Pool): Promise<void> {
    const exists = await pool.query<{ regclass: string | null }>(
      `SELECT to_regclass($1) AS regclass`,
      ['public.message_feed'],
    );

    if (!exists.rows[0]?.regclass) {
      return;
    }

    await pool.query(`REFRESH MATERIALIZED VIEW "message_feed"`);
  }
}

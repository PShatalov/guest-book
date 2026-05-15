import { readFileSync } from 'node:fs';

import { Pool } from 'pg';

function splitMigrationStatements(sql: string): string[] {
  return sql
    .split('--> statement-breakpoint')
    .map((statement) => statement.trim())
    .filter(Boolean);
}

export class TestDatabaseMigrator {
  async applyMigrations(
    databaseUrl: string,
    migrationFilePaths: string[],
  ): Promise<void> {
    const pool = new Pool({ connectionString: databaseUrl });

    try {
      for (const migrationPath of migrationFilePaths) {
        const sql = readFileSync(migrationPath, 'utf8');
        const statements = splitMigrationStatements(sql);

        for (const statement of statements) {
          await pool.query(statement);
        }
      }
    } finally {
      await pool.end();
    }
  }
}

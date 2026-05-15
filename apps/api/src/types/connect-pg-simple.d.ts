declare module 'connect-pg-simple' {
  import type { Pool } from 'pg';
  import type session from 'express-session';

  type PgSessionOptions = {
    pool: Pool;
    tableName?: string;
    createTableIfMissing?: boolean;
  };

  function connectPgSimple(sessionModule: typeof session): {
    new (options: PgSessionOptions): session.Store;
  };

  export default connectPgSimple;
}

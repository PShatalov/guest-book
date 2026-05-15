export type HealthDatabaseState = 'up' | 'down' | 'not_configured';

export type HealthOverallStatus = 'ok' | 'degraded';

export type HealthStatus = {
  status: HealthOverallStatus;
  timestamp: string;
  service: string;
  database: HealthDatabaseState;
};

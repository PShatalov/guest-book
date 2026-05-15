import { Injectable } from '@nestjs/common';
import { DatabaseConnectivityProbe } from './database-connectivity-probe.service';
import type { HealthStatus } from './health-status';

@Injectable()
export class HealthCheckService {
  constructor(
    private readonly databaseConnectivityProbe: DatabaseConnectivityProbe,
  ) {}

  async getStatus(): Promise<HealthStatus> {
    const database = await this.databaseConnectivityProbe.probe();
    const status = database === 'down' ? 'degraded' : 'ok';

    return {
      status,
      timestamp: new Date().toISOString(),
      service: 'guest-book-api',
      database,
    };
  }
}

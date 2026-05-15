import { Injectable } from '@nestjs/common';
import type { HealthStatus } from './health-status';

@Injectable()
export class HealthCheckService {
  getStatus(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'guest-book-api',
    };
  }
}

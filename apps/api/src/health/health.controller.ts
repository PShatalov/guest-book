import { Controller, Get } from '@nestjs/common';
import type { HealthStatus } from './health-status';
import { HealthCheckService } from './health.service';

@Controller('health')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get()
  async check(): Promise<HealthStatus> {
    return this.healthCheckService.getStatus();
  }
}

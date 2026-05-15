import { Module } from '@nestjs/common';
import { HealthCheckController } from './health.controller';
import { HealthCheckService } from './health.service';

@Module({
  controllers: [HealthCheckController],
  providers: [HealthCheckService],
})
export class HealthModule {}

import { Module } from '@nestjs/common';
import { DatabaseConnectivityProbe } from './database-connectivity-probe.service';
import { HealthCheckController } from './health.controller';
import { HealthCheckService } from './health.service';

@Module({
  controllers: [HealthCheckController],
  providers: [DatabaseConnectivityProbe, HealthCheckService],
})
export class HealthModule {}

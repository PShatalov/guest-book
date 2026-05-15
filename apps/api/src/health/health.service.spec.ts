import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseConnectivityProbe } from './database-connectivity-probe.service';
import { HealthCheckService } from './health.service';

describe('HealthCheckService', () => {
  let service: HealthCheckService;
  let probe: { probe: jest.Mock };

  beforeEach(async () => {
    probe = { probe: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthCheckService,
        { provide: DatabaseConnectivityProbe, useValue: probe },
      ],
    }).compile();

    service = module.get(HealthCheckService);
  });

  it('returns ok when database is up', async () => {
    probe.probe.mockResolvedValue('up');

    await expect(service.getStatus()).resolves.toMatchObject({
      status: 'ok',
      service: 'guest-book-api',
      database: 'up',
    });
  });

  it('returns degraded when database is down', async () => {
    probe.probe.mockResolvedValue('down');

    await expect(service.getStatus()).resolves.toMatchObject({
      status: 'degraded',
      database: 'down',
    });
  });

  it('returns ok when database is not configured', async () => {
    probe.probe.mockResolvedValue('not_configured');

    await expect(service.getStatus()).resolves.toMatchObject({
      status: 'ok',
      database: 'not_configured',
    });
  });
});

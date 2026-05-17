import type { ConfigService } from '@nestjs/config';
import type { Params } from 'nestjs-pino';
import type { AppConfig } from '../../config/configuration';
import { createOtelTraceMixin } from './otel-trace-mixin';

export function createPinoLoggerParams(
  configService: ConfigService<AppConfig, true>,
): Params {
  const nodeEnv = configService.get('nodeEnv', { infer: true });
  const isProduction = nodeEnv === 'production';
  const isTest = nodeEnv === 'test';

  return {
    pinoHttp: {
      level: isTest ? 'silent' : isProduction ? 'info' : 'debug',
      autoLogging: !isTest,
      mixin: createOtelTraceMixin,
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'res.headers["set-cookie"]',
        ],
        remove: true,
      },
      transport:
        isProduction || isTest
          ? undefined
          : {
              target: 'pino-pretty',
              options: {
                singleLine: true,
                colorize: true,
              },
            },
      serializers: {
        req: (req: { method: string; url: string }) => ({
          method: req.method,
          url: req.url,
        }),
        res: (res: { statusCode: number }) => ({
          statusCode: res.statusCode,
        }),
      },
    },
  };
}

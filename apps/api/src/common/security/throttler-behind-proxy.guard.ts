import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  type ThrottlerModuleOptions,
  type ThrottlerStorage,
  getOptionsToken,
  getStorageToken,
} from '@nestjs/throttler';
import type { Request } from 'express';
import type { AppConfig } from '../../config/configuration';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  constructor(
    @Inject(getOptionsToken()) options: ThrottlerModuleOptions,
    @Inject(getStorageToken()) storageService: ThrottlerStorage,
    reflector: Reflector,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {
    super(options, storageService, reflector);
  }

  protected async getTracker(req: Request): Promise<string> {
    const trustProxy = this.configService.get('trustProxy', { infer: true });
    if (trustProxy) {
      const forwarded = req.ips;
      if (forwarded.length > 0) {
        return forwarded[0];
      }
    }
    return req.ip ?? 'unknown';
  }
}

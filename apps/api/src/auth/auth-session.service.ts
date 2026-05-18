import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { SafeUserDto } from './user-registration.service';

@Injectable()
export class AuthSessionService {
  async establishSessionAsync(
    request: Request,
    user: SafeUserDto,
  ): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      request.session.regenerate((regenerateError) => {
        if (regenerateError) {
          reject(regenerateError);
          return;
        }

        request.session.userId = user.id;
        request.session.username = user.username;
        request.session.save((saveError) => {
          if (saveError) {
            reject(saveError);
            return;
          }
          resolve();
        });
      });
    });
  }

  getCurrentUser(request: Request): SafeUserDto {
    const { userId, username } = request.session;

    if (!userId || !username) {
      throw new UnauthorizedException('Not authenticated');
    }

    return { id: userId, username };
  }

  getOptionalCurrentUser(request: Request): SafeUserDto | null {
    const { userId, username } = request.session;

    if (!userId || !username) {
      return null;
    }

    return { id: userId, username };
  }

  async destroySession(request: Request): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      request.session.destroy((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}

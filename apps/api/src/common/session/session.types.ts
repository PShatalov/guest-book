import 'express-session';

export type SessionUserPayload = {
  userId: string;
  username: string;
};

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    username?: string;
  }
}

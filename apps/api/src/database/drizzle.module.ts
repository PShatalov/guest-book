import { Global, Module } from '@nestjs/common';
import {
  DrizzleDatabaseProvider,
  drizzleProvider,
} from './drizzle.provider';

@Global()
@Module({
  providers: [DrizzleDatabaseProvider, drizzleProvider],
  exports: [drizzleProvider, DrizzleDatabaseProvider],
})
export class DrizzleModule {}

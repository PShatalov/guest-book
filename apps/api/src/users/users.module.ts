import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsernameSuggestionService } from './username-suggestion.service';
import { UsersController } from './users.controller';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsernameSuggestionService],
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [PrismaModule, AuthModule, BooksModule, FeedbackModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

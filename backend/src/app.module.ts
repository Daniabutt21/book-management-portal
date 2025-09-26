import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';

@Module({
  imports: [PrismaModule, AuthModule, BooksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

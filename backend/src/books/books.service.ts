import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBookDto } from './dto/query-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    // Check if ISBN already exists
    const existingBook = await this.prisma.book.findUnique({
      where: { isbn: createBookDto.isbn },
    });

    if (existingBook) {
      throw new ConflictException('Book with this ISBN already exists');
    }

    // Create the book
    const book = await this.prisma.book.create({
      data: {
        title: createBookDto.title,
        author: createBookDto.author,
        isbn: createBookDto.isbn,
        description: createBookDto.description,
        publishedAt: createBookDto.publishedAt
          ? new Date(createBookDto.publishedAt)
          : null,
      },
    });

    return book;
  }

  async findAll(queryDto: QueryBookDto) {
    const { title, author, isbn, page = 1, limit = 10 } = queryDto;

    // Convert string parameters to integers
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;

    // Build where clause for filtering
    const where: any = {};

    if (title) {
      where.title = {
        contains: title,
      };
    }

    if (author) {
      where.author = {
        contains: author,
      };
    }

    if (isbn) {
      where.isbn = {
        contains: isbn,
      };
    }

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    // Get books and total count
    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          feedbacks: {
            where: { isApproved: true },
            select: {
              id: true,
              rating: true,
            },
          },
        },
      }),
      this.prisma.book.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    return {
      data: books,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    // Check if book exists
    const existingBook = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    // If ISBN is being updated, check for conflicts
    if (updateBookDto.isbn && updateBookDto.isbn !== existingBook.isbn) {
      const isbnExists = await this.prisma.book.findUnique({
        where: { isbn: updateBookDto.isbn },
      });

      if (isbnExists) {
        throw new ConflictException('Book with this ISBN already exists');
      }
    }

    // Update the book
    const book = await this.prisma.book.update({
      where: { id },
      data: {
        ...updateBookDto,
        publishedAt: updateBookDto.publishedAt
          ? new Date(updateBookDto.publishedAt)
          : undefined,
      },
    });

    return book;
  }

  async remove(id: string) {
    // Check if book exists
    const existingBook = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    // Delete the book
    await this.prisma.book.delete({
      where: { id },
    });

    return { message: 'Book deleted successfully' };
  }
}

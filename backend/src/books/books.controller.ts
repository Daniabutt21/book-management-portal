import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBookDto } from './dto/query-book.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new book (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Book successfully created',
    example: {
      id: 'clx1234567890',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0-7432-7356-5',
      description: 'A classic American novel set in the Jazz Age',
      publishedAt: '1925-04-10T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Book with this ISBN already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all books with pagination and filtering' })
  @ApiQuery({
    name: 'title',
    required: false,
    description: 'Filter by book title',
  })
  @ApiQuery({
    name: 'author',
    required: false,
    description: 'Filter by book author',
  })
  @ApiQuery({ name: 'isbn', required: false, description: 'Filter by ISBN' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Books retrieved successfully',
    example: {
      data: [
        {
          id: 'clx1234567890',
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          isbn: '978-0-7432-7356-5',
          description: 'A classic American novel set in the Jazz Age',
          publishedAt: '1925-04-10T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
  })
  findAll(@Query() queryDto: QueryBookDto) {
    return this.booksService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by ID' })
  @ApiResponse({
    status: 200,
    description: 'Book retrieved successfully',
    example: {
      id: 'clx1234567890',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0-7432-7356-5',
      description: 'A classic American novel set in the Jazz Age',
      publishedAt: '1925-04-10T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a book (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Book updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Book with this ISBN already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a book (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Book deleted successfully',
    example: {
      message: 'Book deleted successfully',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }
}

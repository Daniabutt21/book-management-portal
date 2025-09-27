import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { QueryFeedbackDto } from './dto/query-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createFeedbackDto: CreateFeedbackDto) {
    // Check if book exists
    const book = await this.prisma.book.findUnique({
      where: { id: createFeedbackDto.bookId },
    });

    if (!book) {
      throw new NotFoundException(
        `Book with ID ${createFeedbackDto.bookId} not found`
      );
    }

    // Check if user already has feedback for this book
    const existingFeedback = await this.prisma.feedback.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId: createFeedbackDto.bookId,
        },
      },
    });

    if (existingFeedback) {
      throw new ConflictException(
        'You have already provided feedback for this book'
      );
    }

    // Create the feedback
    const feedback = await this.prisma.feedback.create({
      data: {
        rating: createFeedbackDto.rating,
        comment: createFeedbackDto.comment,
        userId,
        bookId: createFeedbackDto.bookId,
        // New feedback requires admin approval
        isApproved: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    });

    return feedback;
  }

  async findAll(queryDto: QueryFeedbackDto) {
    const {
      bookId,
      userId,
      isApproved,
      minRating,
      page = 1,
      limit = 10,
    } = queryDto;

    // Convert string parameters to integers
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;

    // Build where clause for filtering
    const where: any = {};

    if (bookId) {
      where.bookId = bookId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (isApproved !== undefined && isApproved !== null) {
      // Handle both string and boolean values
      if (typeof isApproved === 'string') {
        where.isApproved = isApproved === 'true';
      } else {
        where.isApproved = isApproved;
      }
    }

    if (minRating !== undefined && minRating !== null) {
      where.rating = {
        gte: minRating,
      };
    }

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    // Get feedback and total count
    const [feedback, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          book: {
            select: {
              id: true,
              title: true,
              author: true,
            },
          },
        },
      }),
      this.prisma.feedback.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    return {
      data: feedback,
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
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    return feedback;
  }

  async update(
    id: string,
    updateFeedbackDto: UpdateFeedbackDto,
    userId: string,
    userRole: string
  ) {
    // Check if feedback exists
    const existingFeedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!existingFeedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    // Check permissions
    const isOwner = existingFeedback.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only update your own feedback');
    }

    // Regular users can only update their own feedback if it's not approved
    if (isOwner && !isAdmin && existingFeedback.isApproved) {
      throw new ForbiddenException('Cannot update approved feedback');
    }

    // Only admins can change approval status
    if (updateFeedbackDto.isApproved !== undefined && !isAdmin) {
      throw new ForbiddenException('Only admins can change approval status');
    }

    // Update the feedback
    const feedback = await this.prisma.feedback.update({
      where: { id },
      data: {
        ...updateFeedbackDto,
        // If a regular user is updating, reset approval status
        isApproved: isAdmin ? updateFeedbackDto.isApproved : false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    });

    return feedback;
  }

  async remove(id: string, userId: string, userRole: string) {
    // Check if feedback exists
    const existingFeedback = await this.prisma.feedback.findUnique({
      where: { id },
    });

    if (!existingFeedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    // Check permissions
    const isOwner = existingFeedback.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only delete your own feedback');
    }

    // Delete the feedback
    await this.prisma.feedback.delete({
      where: { id },
    });

    return { message: 'Feedback deleted successfully' };
  }

  async getBookFeedback(bookId: string, queryDto: QueryFeedbackDto) {
    // Check if book exists
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    // Get approved feedback for the book
    const feedbackQuery = {
      ...queryDto,
      bookId,
      // Only show approved feedback for public view
      isApproved: true,
    };

    return this.findAll(feedbackQuery);
  }

  async getUserFeedback(userId: string, queryDto: QueryFeedbackDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const feedbackQuery = {
      ...queryDto,
      userId,
    };

    return this.findAll(feedbackQuery);
  }

  async approveFeedback(id: string) {
    // Check if feedback exists
    const existingFeedback = await this.prisma.feedback.findUnique({
      where: { id },
    });

    if (!existingFeedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    if (existingFeedback.isApproved) {
      throw new BadRequestException('Feedback is already approved');
    }

    // Approve the feedback
    const feedback = await this.prisma.feedback.update({
      where: { id },
      data: { isApproved: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    });

    return feedback;
  }

  async rejectFeedback(id: string) {
    // Check if feedback exists
    const existingFeedback = await this.prisma.feedback.findUnique({
      where: { id },
    });

    if (!existingFeedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    if (!existingFeedback.isApproved) {
      throw new BadRequestException('Feedback is already rejected');
    }

    // Reject the feedback
    const feedback = await this.prisma.feedback.update({
      where: { id },
      data: { isApproved: false },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    });

    return feedback;
  }
}

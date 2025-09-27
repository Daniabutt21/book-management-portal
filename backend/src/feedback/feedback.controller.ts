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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { QueryFeedbackDto } from './dto/query-feedback.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Feedback')
@ApiBearerAuth('JWT-auth')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit feedback for a book' })
  @ApiResponse({
    status: 201,
    description: 'Feedback submitted successfully (pending admin approval)',
    example: {
      id: 'feedback-123',
      rating: 5,
      comment: 'This book was absolutely amazing!',
      userId: 'user-456',
      bookId: 'book-789',
      isApproved: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      user: {
        id: 'user-456',
        name: 'John Doe',
        email: 'john@example.com',
      },
      book: {
        id: 'book-789',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Book not found' })
  @ApiResponse({
    status: 409,
    description: 'Feedback already exists for this book',
  })
  async create(@Request() req, @Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.create(req.user.id, createFeedbackDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all feedback with filtering (Admin only)' })
  @ApiQuery({
    name: 'bookId',
    required: false,
    description: 'Filter by book ID',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
  })
  @ApiQuery({
    name: 'isApproved',
    required: false,
    description: 'Filter by approval status',
  })
  @ApiQuery({
    name: 'minRating',
    required: false,
    description: 'Filter by minimum rating',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved feedback list',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async findAll(@Query() queryDto: QueryFeedbackDto) {
    return this.feedbackService.findAll(queryDto);
  }

  @Get('book/:bookId')
  @ApiOperation({ summary: 'Get approved feedback for a specific book' })
  @ApiParam({ name: 'bookId', description: 'Book ID to get feedback for' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'isApproved',
    required: false,
    description: 'Filter by approval status (always true for public endpoint)',
    example: 'true',
    enum: ['true'],
    allowEmptyValue: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved book feedback',
  })
  @ApiResponse({ status: 404, description: 'Book not found' })
  async getBookFeedback(
    @Param('bookId') bookId: string,
    @Query() queryDto: QueryFeedbackDto
  ) {
    return this.feedbackService.getBookFeedback(bookId, queryDto);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get feedback by a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID to get feedback for' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user feedback',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserFeedback(
    @Param('userId') userId: string,
    @Query() queryDto: QueryFeedbackDto
  ) {
    return this.feedbackService.getUserFeedback(userId, queryDto);
  }

  @Get('my-feedback')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user feedback' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved current user feedback',
  })
  async getMyFeedback(@Request() req, @Query() queryDto: QueryFeedbackDto) {
    return this.feedbackService.getUserFeedback(req.user.id, queryDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get feedback by ID' })
  @ApiParam({ name: 'id', description: 'Feedback ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved feedback details',
  })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update feedback (owner or admin)' })
  @ApiParam({ name: 'id', description: 'Feedback ID to update' })
  @ApiResponse({ status: 200, description: 'Feedback updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own feedback',
  })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async update(
    @Param('id') id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
    @Request() req
  ) {
    return this.feedbackService.update(
      id,
      updateFeedbackDto,
      req.user.id,
      req.user.role.name
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete feedback (owner or admin)' })
  @ApiParam({ name: 'id', description: 'Feedback ID to delete' })
  @ApiResponse({ status: 200, description: 'Feedback deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only delete own feedback',
  })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.feedbackService.remove(id, req.user.id, req.user.role.name);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Approve feedback (Admin only)' })
  @ApiParam({ name: 'id', description: 'Feedback ID to approve' })
  @ApiResponse({ status: 200, description: 'Feedback approved successfully' })
  @ApiResponse({ status: 400, description: 'Feedback is already approved' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async approveFeedback(@Param('id') id: string) {
    return this.feedbackService.approveFeedback(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Reject feedback (Admin only)' })
  @ApiParam({ name: 'id', description: 'Feedback ID to reject' })
  @ApiResponse({ status: 200, description: 'Feedback rejected successfully' })
  @ApiResponse({ status: 400, description: 'Feedback is already rejected' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async rejectFeedback(@Param('id') id: string) {
    return this.feedbackService.rejectFeedback(id);
  }
}

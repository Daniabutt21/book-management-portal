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
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Get all users with pagination and filtering (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    example: {
      data: [
        {
          id: 'clx1234567890',
          email: 'john@example.com',
          name: 'John Doe',
          roleId: 'user',
          role: {
            id: 'user',
            name: 'USER',
            description: 'Regular user with basic permissions',
          },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    },
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Search by user name',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Search by user email',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filter by role name',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  findAll(@Query() queryDto: QueryUserDto) {
    return this.usersService.findAll(queryDto);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    example: {
      totalUsers: 10,
      userRoleCount: 8,
      adminRoleCount: 2,
    },
  })
  getUserStats() {
    return this.usersService.getUserStats();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile retrieved successfully',
    example: {
      id: 'clx1234567890',
      email: 'john@example.com',
      name: 'John Doe',
      roleId: 'user',
      role: {
        id: 'user',
        name: 'USER',
        description: 'Regular user with basic permissions',
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  })
  getCurrentUser(@Request() req) {
    return req.user;
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    example: {
      id: 'clx1234567890',
      email: 'john@example.com',
      name: 'John Doe',
      roleId: 'user',
      role: {
        id: 'user',
        name: 'USER',
        description: 'Regular user with basic permissions',
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    example: {
      statusCode: 404,
      message: 'User with ID clx1234567890 not found',
      error: 'Not Found',
    },
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    example: {
      id: 'clx1234567890',
      email: 'john.updated@example.com',
      name: 'John Updated',
      roleId: 'user',
      role: {
        id: 'user',
        name: 'USER',
        description: 'Regular user with basic permissions',
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Change user role (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User role changed successfully',
    example: {
      id: 'clx1234567890',
      email: 'john@example.com',
      name: 'John Doe',
      roleId: 'admin',
      role: {
        id: 'admin',
        name: 'ADMIN',
        description: 'Administrator with full permissions',
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User or role not found',
  })
  @ApiResponse({
    status: 400,
    description: 'User already has this role',
  })
  changeRole(@Param('id') id: string, @Body() changeRoleDto: ChangeRoleDto) {
    return this.usersService.changeRole(id, changeRoleDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    example: {
      message: 'User deleted successfully',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete user with existing feedback',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

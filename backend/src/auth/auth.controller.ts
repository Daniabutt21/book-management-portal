import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    example: {
      id: 'clx1234567890',
      email: 'john@example.com',
      name: 'John Doe',
      roleId: 'user',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
    example: {
      statusCode: 409,
      message: 'User with this email already exists',
      error: 'Conflict',
    },
  })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(
      signupDto.email,
      signupDto.password,
      signupDto.name
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user with email and password' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    example: {
      user: {
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
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
    example: {
      statusCode: 401,
      message: 'Invalid email or password',
      error: 'Unauthorized',
    },
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
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
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  getProfile(@Request() req) {
    return req.user;
  }
}

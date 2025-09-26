import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService Integration', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [AuthService, PrismaService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prismaService.user.deleteMany({
      where: {
        email: {
          in: ['test@example.com', 'test2@example.com', 'test3@example.com'],
        },
      },
    });
  });

  describe('signup integration', () => {
    const signupData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should create user with real database and hash password', async () => {
      // Act
      const result = await service.signup(
        signupData.email,
        signupData.password,
        signupData.name
      );

      // Assert - Check service response
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', signupData.email);
      expect(result).toHaveProperty('name', signupData.name);
      expect(result).toHaveProperty('roleId', 'user');
      expect(result).not.toHaveProperty('password');

      // Assert - Check database integration
      const dbUser = await prismaService.user.findUnique({
        where: { email: signupData.email },
      });

      expect(dbUser).toBeDefined();
      expect(dbUser?.email).toBe(signupData.email);
      expect(dbUser?.name).toBe(signupData.name);
      expect(dbUser?.roleId).toBe('user');
      expect(dbUser?.password).toBeDefined();
      expect(dbUser?.password).not.toBe(signupData.password); // Should be hashed

      // Assert - Verify password is actually hashed
      const isPasswordHashed = await bcrypt.compare(
        signupData.password,
        dbUser?.password || ''
      );
      expect(isPasswordHashed).toBe(true);
    });

    it('should throw ConflictException when user already exists in database', async () => {
      // Arrange - Create user first
      await service.signup(
        signupData.email,
        signupData.password,
        signupData.name
      );

      // Act & Assert - Try to create same user again
      await expect(
        service.signup(signupData.email, signupData.password, signupData.name)
      ).rejects.toThrow(ConflictException);
      await expect(
        service.signup(signupData.email, signupData.password, signupData.name)
      ).rejects.toThrow('User with this email already exists');

      // Assert - Only one user should exist in database
      const users = await prismaService.user.findMany({
        where: { email: signupData.email },
      });
      expect(users).toHaveLength(1);
    });

    it('should handle database connection and transaction properly', async () => {
      // Test that service properly handles database operations
      const result = await service.signup(
        'test2@example.com',
        'password123',
        'Test User 2'
      );

      // Verify user was created and can be retrieved
      const dbUser = await prismaService.user.findUnique({
        where: { email: 'test2@example.com' },
      });

      expect(dbUser).toBeDefined();
      expect(dbUser?.id).toBe(result.id);
    });

    it('should assign default role correctly', async () => {
      const result = await service.signup(
        'test3@example.com',
        'password123',
        'Test User 3'
      );

      // Check that user has default role
      expect(result.roleId).toBe('user');

      // Verify in database
      const dbUser = await prismaService.user.findUnique({
        where: { email: 'test3@example.com' },
        include: { role: true },
      });

      expect(dbUser?.roleId).toBe('user');
      expect(dbUser?.role?.name).toBe('USER');
    });
  });
});

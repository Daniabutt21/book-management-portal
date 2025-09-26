import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  // Mock PrismaService
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    const signupData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should create a new user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      const createdUser = {
        id: 'user123',
        email: signupData.email,
        name: signupData.name,
        password: hashedPassword,
        roleId: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(createdUser);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await service.signup(
        signupData.email,
        signupData.password,
        signupData.name
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signupData.email },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(signupData.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: signupData.email,
          password: hashedPassword,
          name: signupData.name,
          roleId: 'user',
        },
      });

      // Should not return password in response
      expect(result).toEqual({
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        roleId: createdUser.roleId,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException if user already exists', async () => {
      const existingUser = {
        id: 'existing123',
        email: signupData.email,
        name: 'Existing User',
        password: 'hashedPassword',
        roleId: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      await expect(
        service.signup(signupData.email, signupData.password, signupData.name)
      ).rejects.toThrow(ConflictException);
      await expect(
        service.signup(signupData.email, signupData.password, signupData.name)
      ).rejects.toThrow('User with this email already exists');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signupData.email },
      });
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should hash password with correct salt rounds', async () => {
      const hashedPassword = 'hashedPassword123';
      const createdUser = {
        id: 'user123',
        email: signupData.email,
        name: signupData.name,
        password: hashedPassword,
        roleId: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(createdUser);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      await service.signup(
        signupData.email,
        signupData.password,
        signupData.name
      );

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(signupData.password, 10);
    });
  });
});

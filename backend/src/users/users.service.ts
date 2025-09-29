import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(queryDto: QueryUserDto) {
    const { name, email, role, page = 1, limit = 10 } = queryDto;

    // Build where clause for filtering
    const where: any = {};

    if (name) {
      where.name = {
        contains: name,
      };
    }

    if (email) {
      where.email = {
        contains: email,
      };
    }

    if (role) {
      where.role = {
        name: role,
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get users with pagination
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          role: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Remove password from response
    const usersWithoutPassword = users.map(({ password, ...user }) => user);

    return {
      data: usersWithoutPassword,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check for email conflicts if email is being updated
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Prepare update data
    const updateData: any = { ...updateUserDto };

    // Hash password if provided
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async remove(id: string) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if user has any feedback
    const userFeedback = await this.prisma.feedback.findFirst({
      where: { userId: id },
    });

    if (userFeedback) {
      throw new BadRequestException(
        'Cannot delete user with existing feedback. Please delete feedback first.'
      );
    }

    // Delete user
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async changeRole(id: string, changeRoleDto: ChangeRoleDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id: changeRoleDto.roleId },
    });

    if (!role) {
      throw new NotFoundException(
        `Role with ID ${changeRoleDto.roleId} not found`
      );
    }

    // Check if user already has this role
    if (existingUser.roleId === changeRoleDto.roleId) {
      throw new BadRequestException('User already has this role');
    }

    // Update user role
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { roleId: changeRoleDto.roleId },
      include: {
        role: true,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async getUserStats() {
    const [totalUsers, userRoleCount, adminRoleCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { role: { name: 'USER' } },
      }),
      this.prisma.user.count({
        where: { role: { name: 'ADMIN' } },
      }),
    ]);

    return {
      totalUsers,
      userRoleCount,
      adminRoleCount,
    };
  }
}

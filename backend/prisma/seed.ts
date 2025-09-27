import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default roles
  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      id: 'user',
      name: 'USER',
      description: 'Regular user with basic permissions',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      id: 'admin',
      name: 'ADMIN',
      description: 'Administrator with full permissions',
    },
  });

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Admin User',
      roleId: 'admin',
    },
  });

  console.log('Seeded roles:', { userRole, adminRole });
  console.log('Seeded admin user:', {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminRole.name,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

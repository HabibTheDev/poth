import bcrypt from 'bcrypt';
import config from '../config';
import prisma from './prisma';
import logger from '../utils/logger';

const seedSuperAdmin = async (): Promise<void> => {
  try {
    const superAdminEmail = config.super_admin_email;

    const existingByEmail = await prisma.user.findUnique({
      where: { email: superAdminEmail },
      select: { id: true, role: true, isDeleted: true },
    });

    if (existingByEmail) {
      if (existingByEmail.role === 'SUPER_ADMIN' && !existingByEmail.isDeleted) {
        logger.info('Super admin already exists');
        return;
      }
      const hashedPassword = await bcrypt.hash(
        config.super_admin_password,
        Number(config.bcrypt_salt_rounds)
      );
      await prisma.user.update({
        where: { email: superAdminEmail },
        data: {
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          needsPasswordChange: false,
          isDeleted: false,
        },
      });
      logger.info('Existing user promoted to super admin');
      return;
    }

    const existingByRole = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN', isDeleted: false },
      select: { id: true },
    });

    if (existingByRole) {
      logger.info('Super admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(
      config.super_admin_password,
      Number(config.bcrypt_salt_rounds)
    );

    await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        fullName: 'Super Admin',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        needsPasswordChange: false,
      },
    });

    await prisma.systemSetting.createMany({
      data: [
        {
          key: 'incident_default_radius_km',
          value: { value: 5, unit: 'km' },
        },
        {
          key: 'incident_alert_distance_m',
          value: { value: 100, unit: 'm' },
        },
        {
          key: 'fuel_default_mileage',
          value: { petrol: 15, diesel: 18, cng: 22, hybrid: 20 },
        },
        {
          key: 'toll_currency',
          value: { currency: 'BDT' },
        },
      ],
      skipDuplicates: true,
    });

    logger.info('Super admin created successfully');
  } catch (error) {
    logger.error({ error }, 'Error seeding super admin');
    throw error;
  }
};

const seedSystemRoles = async (): Promise<void> => {
  try {
    const roles = [
      { name: 'SUPER_ADMIN', description: 'Full system access', isSystem: true, permissions: ['*'] },
      { name: 'ADMIN', description: 'Administrative access', isSystem: true, permissions: ['*'] },
      { name: 'MODERATOR', description: 'Content moderation', isSystem: true, permissions: ['incident.*', 'community.*', 'user.*'] },
      { name: 'USER', description: 'Standard user', isSystem: true, permissions: ['self.*'] },
    ];

    for (const role of roles) {
      await prisma.role.upsert({
        where: { name: role.name },
        update: { description: role.description, permissions: role.permissions as any },
        create: role,
      });
    }

    logger.info('System roles seeded successfully');
  } catch (error) {
    logger.error({ error }, 'Error seeding roles');
    throw error;
  }
};

if (require.main === module) {
  Promise.all([seedSuperAdmin(), seedSystemRoles()])
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedSuperAdmin, seedSystemRoles };

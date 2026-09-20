import bcrypt from 'bcrypt';
import config from '../config';
import prisma from './prisma';
import logger from '../utils/logger';

const updateSuperAdminPassword = async () => {
  try {
    const superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (!superAdmin) {
      logger.info('No super admin found');
      return;
    }

    logger.info({ 
      email: superAdmin.email,
      configEmail: config.super_admin_email,
      configPassword: config.super_admin_password,
      saltRounds: config.bcrypt_salt_rounds
    }, 'Current super admin and config');

    const hashedPassword = await bcrypt.hash(config.super_admin_password, 12);

    await prisma.user.update({
      where: { id: superAdmin.id },
      data: {
        password: hashedPassword,
        email: config.super_admin_email,
      },
    });

    const testMatch = await bcrypt.compare(config.super_admin_password, hashedPassword);
    logger.info({ testMatch }, 'Password hash test');

    logger.info('Super admin password updated successfully');
  } catch (error) {
    logger.error({ error }, 'Error updating super admin password');
    throw error;
  }
};

updateSuperAdminPassword()
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
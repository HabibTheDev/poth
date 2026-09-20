import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import config from '../../config';
import prisma from '../../database/prisma';
import AppError from '../../errors/AppError';
import { UserService } from '../User/user.service';
import { TUserRole } from '../../shared/user.types';

interface ITokenPayload {
  userId: string;
  email: string;
  role: TUserRole;
}

interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

const generateAccessToken = (payload: ITokenPayload): string => {
  const { jwt_access_secret, jwt_access_expires_in } = config;
  if (!jwt_access_secret) {
    throw new Error('JWT access secret is not configured');
  }
  return jwt.sign(payload, jwt_access_secret, {
    expiresIn: jwt_access_expires_in,
  } as any);
};

const generateRefreshToken = (payload: ITokenPayload): string => {
  const { jwt_refresh_secret, jwt_refresh_expires_in } = config;
  if (!jwt_refresh_secret) {
    throw new Error('JWT refresh secret is not configured');
  }
  return jwt.sign(payload, jwt_refresh_secret, {
    expiresIn: jwt_refresh_expires_in,
  } as any);
};

const saveRefreshToken = async (userId: string, refreshToken: string, userAgent?: string, ipAddress?: string): Promise<void> => {
  const decoded = jwt.verify(refreshToken, config.jwt_refresh_secret!) as jwt.JwtPayload;
  const expiresAt = new Date((decoded.exp as number) * 1000);

  await prisma.refreshToken.create({
    data: {
      userId,
      token: refreshToken,
      expiresAt,
      userAgent,
      ipAddress,
    },
  });
};

const issueTokens = (user: { id: string; email: string; role: TUserRole }): IAuthTokens => {
  const payload: ITokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as TUserRole,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

const register = async (payload: {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}): Promise<{ user: any; tokens: IAuthTokens }> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, 'User with this email already exists');
  }

  const user = await UserService.createUser({
    ...payload,
    status: 'ACTIVE',
    role: 'USER',
  });

  const tokens = issueTokens({
    id: user.id,
    email: user.email,
    role: user.role as TUserRole,
  });

  await saveRefreshToken(user.id, tokens.refreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const { password: _pwd, ...safeUser } = user;

  return {
    user: safeUser,
    tokens,
  };
};

const login = async (payload: {
  email: string;
  password: string;
}): Promise<{ user: any; tokens: IAuthTokens }> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User account has been deleted');
  }

  if (user.status === 'BLOCKED') {
    throw new AppError(httpStatus.FORBIDDEN, 'User account is blocked');
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError(httpStatus.FORBIDDEN, 'User account is not active');
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  const tokens = issueTokens({
    id: user.id,
    email: user.email,
    role: user.role as TUserRole,
  });

  await saveRefreshToken(user.id, tokens.refreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const { password: _pwd, ...safeUser } = user;

  return {
    user: safeUser,
    tokens,
  };
};

const refreshToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  if (!refreshToken) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Refresh token is required');
  }

  let decoded: any;
  try {
    decoded = jwt.verify(refreshToken, config.jwt_refresh_secret!);
  } catch {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }

  if (storedToken.revoked) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Refresh token has been revoked');
  }

  if (new Date() > storedToken.expiresAt) {
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    throw new AppError(httpStatus.UNAUTHORIZED, 'Refresh token has expired');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId, isDeleted: false },
    select: { id: true, email: true, role: true, status: true },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.status === 'BLOCKED') {
    throw new AppError(httpStatus.FORBIDDEN, 'User account is blocked');
  }

  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role as TUserRole,
  });

  return { accessToken: newAccessToken };
};

const logout = async (refreshToken: string, userId: string): Promise<void> => {
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken, userId },
      data: { revoked: true },
    });
  }

  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
};

const forgotPassword = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode,
        resetCodeExpiry,
      },
    });

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Password Reset Request</h2>
    <p>Your password reset code is: <strong>${resetCode}</strong></p>
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  </div>
</body>
</html>
`;

    try {
      await import('../../utils/sendEmail').then((mod) =>
        mod.sendEmail(user.email, htmlBody, 'Password Reset Request')
      );
    } catch (error) {
      console.error('Failed to send reset email:', error);
    }
  }
};

const resetPassword = async (payload: {
  id: string;
  code: string;
  newPassword: string;
}): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.resetCode || user.resetCode !== payload.code) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired reset code');
  }

  if (user.resetCodeExpiry && new Date() > user.resetCodeExpiry) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Reset code has expired');
  }

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetCode: null,
      resetCodeExpiry: null,
      passwordChangedAt: new Date(),
      needsPasswordChange: false,
    },
  });
};

export const AuthService = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  issueTokens,
  generateAccessToken,
  generateRefreshToken,
};

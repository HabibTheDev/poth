import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import catchAsync from '../utils/catchAsync';
import { TUserRole } from '../modules/User/user.constant';
import prisma from '../database/prisma';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Try to get token from Authorization header first, then from cookies
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader) {
      token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }

    const decoded = jwt.verify(token, config.jwt_access_secret) as JwtPayload;

    const { role, userId, iat } = decoded;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (user.isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, 'User has been deleted');
    }

    if (user.status === ('blocked' as any)) {
      throw new AppError(httpStatus.FORBIDDEN, 'User is blocked');
    }

    if (
      user.passwordChangedAt &&
      isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
    ) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Token is invalid');
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }

    req.user = decoded as JwtPayload & { role: string };
    next();
  });
};

const isJWTIssuedBeforePasswordChanged = (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number
): boolean => {
  const passwordChangedTime = new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

export default auth;

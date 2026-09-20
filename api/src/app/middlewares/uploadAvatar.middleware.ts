import multer from 'multer';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';
import { getMulterStorage } from '../utils/storage';

const storage = getMulterStorage();

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(httpStatus.BAD_REQUEST, 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.'));
  }
};

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const uploadAvatarSingle = uploadAvatar.single('avatar');

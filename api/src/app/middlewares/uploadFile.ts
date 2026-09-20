import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3-v3';
import { Request } from 'express';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';
import config from '../config';

export const s3 = new S3Client({
  region: config.aws_region,
  credentials: {
    accessKeyId: config.aws_access_key_id || '',
    secretAccessKey: config.aws_secret_access_key || '',
  },
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav'];
const ALLOWED_VIDEO_TYPES = ['video/mp4'];
const ALL_ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
  ...ALLOWED_AUDIO_TYPES,
  ...ALLOWED_VIDEO_TYPES,
];

interface UploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  fieldName?: string;
  useS3?: boolean; // Toggle between memory storage and direct S3 upload
  bucket?: string; // Custom bucket name (defaults to env AWS_S3_BUCKET)
  acl?: string; // S3 ACL (public-read, private, etc.)
  multiple?: boolean; // Allow multiple files with same field name
  maxCount?: number; // Max number of files (for multiple)
  fields?: Array<{ name: string; maxCount: number }>; // Multiple fields with different names
}

export const createUploadMiddleware = (options: UploadOptions = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ALL_ALLOWED_TYPES,
    fieldName = 'file',
    useS3 = false, // Default to memory storage
    bucket = config.aws_s3_bucket || 'quran-app-uploads',
    acl = 'public-read',
    multiple = false,
    maxCount = 10,
    fields,
  } = options;

  // Choose storage based on useS3 option
  const storage = useS3
    ? multerS3({
        s3,
        bucket,
        acl,
        metadata(req: Request, file: Express.Multer.File, cb: any) {
          cb(null, { fieldName: file.fieldname });
        },
        key(req: Request, file: Express.Multer.File, cb: any) {
          const fileName = `${Date.now()}_${file.originalname}`;
          cb(null, fileName);
        },
        contentType: (multerS3 as any).AUTO_CONTENT_TYPE,
      })
    : multer.memoryStorage();

  const upload = multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new AppError(httpStatus.BAD_REQUEST, 'Invalid file type') as any,
          false,
        );
      }
    },
  });

  // Return appropriate multer method based on options
  if (fields) {
    return upload.fields(fields);
  } else if (multiple) {
    return upload.array(fieldName, maxCount);
  } else {
    return upload.single(fieldName);
  }
};

// MEMORY STORAGE (for manual S3 upload)
// Use these when you want to upload to S3 manually with uploadToS3() utility
// File will be available at req.file.buffer

export const uploadSingleFile = createUploadMiddleware();

export const uploadImage = createUploadMiddleware({
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ALLOWED_IMAGE_TYPES,
});

export const uploadDocument = createUploadMiddleware({
  allowedTypes: ALLOWED_DOCUMENT_TYPES,
});

export const uploadChatFile = createUploadMiddleware();

export const uploadAvatar = createUploadMiddleware({
  maxSize: 2 * 1024 * 1024,
  allowedTypes: ALLOWED_IMAGE_TYPES,
});

// DIRECT S3 UPLOAD
// Use these for automatic S3 upload without manual uploadToS3() call
// File will be available at req.file.location (S3 URL)

/**
 * Direct S3 upload - file goes straight to S3 bucket
 * Access uploaded file URL at: req.file.location
 */
export const uploadFileS3 = createUploadMiddleware({
  useS3: true,
  maxSize: 100 * 1024 * 1024, // 100MB
});

export const uploadImageS3 = createUploadMiddleware({
  useS3: true,
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ALLOWED_IMAGE_TYPES,
});

export const uploadDocumentS3 = createUploadMiddleware({
  useS3: true,
  allowedTypes: ALLOWED_DOCUMENT_TYPES,
});


// MULTIPLE FILES UPLOAD

/**
 * Upload multiple files with same field name (memory storage)
 * Access files at: req.files (array)
 */
export const uploadMultipleFiles = createUploadMiddleware({
  multiple: true,
  maxCount: 10,
});

export const uploadMultipleImages = createUploadMiddleware({
  multiple: true,
  maxCount: 10,
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ALLOWED_IMAGE_TYPES,
});

/**
 * Upload multiple files with same field name (direct S3)
 * Access files at: req.files (array)
 * Each file has .location property with S3 URL
 */
export const uploadMultipleFilesS3 = createUploadMiddleware({
  useS3: true,
  multiple: true,
  maxCount: 10,
});

export const uploadMultipleImagesS3 = createUploadMiddleware({
  useS3: true,
  multiple: true,
  maxCount: 10,
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ALLOWED_IMAGE_TYPES,
});

// MULTIPLE FIELDS UPLOAD

/**
 * Upload multiple files from different fields (memory storage)
 * Access files at: req.files (object with field names as keys)
 * Example: req.files['avatar'][0], req.files['gallery'][0]
 */
export const uploadMixedFields = createUploadMiddleware({
  fields: [
    { name: 'avatar', maxCount: 1 },
    { name: 'gallery', maxCount: 5 },
  ],
});

/**
 * Upload multiple files from different fields (direct S3)
 */
export const uploadMixedFieldsS3 = createUploadMiddleware({
  useS3: true,
  fields: [
    { name: 'avatar', maxCount: 1 },
    { name: 'gallery', maxCount: 5 },
  ],
});
export const uploadAvatarS3 = createUploadMiddleware({
  useS3: true,
  maxSize: 2 * 1024 * 1024,
  allowedTypes: ALLOWED_IMAGE_TYPES,
});

export const uploadChatFileS3 = createUploadMiddleware({
  useS3: true,
  maxSize: 10 * 1024 * 1024,
});

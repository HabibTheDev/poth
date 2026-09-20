import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../config';
import logger from './logger';
import crypto from 'crypto';
import path from 'path';

const s3Client = new S3Client({
  region: config.aws_region,
  credentials: {
    accessKeyId: config.aws_access_key_id || '',
    secretAccessKey: config.aws_secret_access_key || '',
  },
});

interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

export const uploadToS3 = async (
  file: Express.Multer.File,
  folder: string = 'uploads'
): Promise<UploadResult> => {
  try {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${folder}/${crypto.randomUUID()}${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: config.aws_s3_bucket!,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    const url = `https://${config.aws_s3_bucket}.s3.${config.aws_region}.amazonaws.com/${fileName}`;

    logger.info({ fileName }, 'File uploaded to S3');

    return {
      key: fileName,
      url,
      bucket: config.aws_s3_bucket!,
    };
  } catch (error) {
    logger.error({ error }, '');
    throw new Error('Failed to upload file to S3');
  }
};

export const uploadBufferToS3 = async (
  buffer: Buffer,
  fileName: string,
  mimetype: string,
  folder: string = 'uploads'
): Promise<UploadResult> => {
  try {
    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: config.aws_s3_bucket!,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    const url = `https://${config.aws_s3_bucket}.s3.${config.aws_region}.amazonaws.com/${key}`;

    logger.info({ key }, 'Buffer uploaded to S3');

    return {
      key,
      url,
      bucket: config.aws_s3_bucket!,
    };
  } catch (error) {
    logger.error({ error }, '');
    throw new Error('Failed to upload buffer to S3');
  }
};

export const deleteFromS3 = async (key: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: config.aws_s3_bucket!,
      Key: key,
    });

    await s3Client.send(command);
    logger.info({ key }, 'File deleted from S3');
  } catch (error) {
    logger.error({ error }, '');
    throw new Error('Failed to delete file from S3');
  }
};

export const getSignedUrlFromS3 = async (key: string, expiresIn: number = 3600): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: config.aws_s3_bucket!,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    logger.error({ error }, '');
    throw new Error('Failed to generate signed URL');
  }
};

export const uploadMultipleToS3 = async (
  files: Express.Multer.File[],
  folder: string = 'uploads'
): Promise<UploadResult[]> => {
  const uploadPromises = files.map((file) => uploadToS3(file, folder));
  return Promise.all(uploadPromises);
};


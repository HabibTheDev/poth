import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import config from '../config';

// Configure Cloudinary
if (config.cloudinary_cloud_name && config.cloudinary_api_key && config.cloudinary_api_secret) {
  cloudinary.config({
    cloud_name: config.cloudinary_cloud_name,
    api_key: config.cloudinary_api_key,
    api_secret: config.cloudinary_api_secret,
  });
}

const isVercel = process.env.VERCEL === '1';
const uploadDir = isVercel ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const s3Client = new S3Client({
  region: config.aws_region,
  credentials: {
    accessKeyId: config.aws_access_key_id as string,
    secretAccessKey: config.aws_secret_access_key as string,
  },
});

export const getMulterStorage = () => {
  const provider = config.storage_provider || 'local';

  if (provider === 'local') {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      },
    });
  }

  return multer.memoryStorage();
};

export const uploadFile = async (file: Express.Multer.File): Promise<string> => {
  const provider = config.storage_provider || 'local';

  if (provider === 'local') {
    // On Vercel, save to /tmp (ephemeral - files will be lost after function execution)
    if (isVercel) {
      console.warn('⚠️  WARNING: Using local storage on Vercel. Files will be lost after deployment or function timeout!');
    }
    
    let filename: string;
    
    // If file was saved via diskStorage, use existing filename
    if (file.filename) {
      filename = file.filename;
    } 
    // If using memoryStorage, save the buffer to disk
    else if (file.buffer) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      filename = uniqueSuffix + path.extname(file.originalname);
      const filePath = path.join(uploadDir, filename);
      
      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, new Uint8Array(file.buffer));
    } else {
      filename = file.filename;
    }
    
    // Return full URL instead of just filename
    return `${config.base_url}/uploads/${filename}`;
  }

  if (provider === 's3') {
    const key = `${Date.now()}-${file.originalname}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: config.aws_s3_bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );
    // Return full S3 URL
    return `https://${config.aws_s3_bucket}.s3.${config.aws_region}.amazonaws.com/${key}`;
  }

  if (provider === 'bunnynet') {
    const fileName = `${Date.now()}-${file.originalname}`;
    await axios.put(
      `https://storage.bunnycdn.com/${config.bunnynet_storage_zone}/${fileName}`,
      file.buffer,
      {
        headers: {
          AccessKey: config.bunnynet_access_key,
          'Content-Type': file.mimetype,
        },
      }
    );
    // Return full CDN URL
    return `https://${config.bunnynet_cdn_url}/${fileName}`;
  }

  if (provider === 'contabo') {
    const contaboClient = new S3Client({
      region: config.contabo_region,
      endpoint: config.contabo_endpoint,
      credentials: {
        accessKeyId: config.contabo_access_key as string,
        secretAccessKey: config.contabo_secret_key as string,
      },
    });
    const key = `${Date.now()}-${file.originalname}`;
    await contaboClient.send(
      new PutObjectCommand({
        Bucket: config.contabo_bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );
    // Return full Contabo URL
    return `${config.contabo_endpoint}/${config.contabo_bucket}/${key}`;
  }

  if (provider === 'cloudinary') {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'quran-uploads',
          resource_type: 'auto',
          public_id: `${Date.now()}-${path.parse(file.originalname).name}`,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            // Return full Cloudinary URL with optimizations
            const url = cloudinary.url(result!.public_id, {
              secure: true,
              fetch_format: 'auto',
              quality: 'auto',
            });
            resolve(url);
          }
        }
      );
      uploadStream.end(file.buffer);
    });
  }

  throw new Error('Invalid storage provider');
};

export const deleteFile = async (fileUrlOrKey: string): Promise<void> => {
  const provider = config.storage_provider || 'local';

  if (provider === 'local') {
    // Extract filename from URL: http://localhost:5000/uploads/filename.jpg -> filename.jpg
    const filename = fileUrlOrKey.includes('/uploads/') 
      ? fileUrlOrKey.split('/uploads/').pop() || fileUrlOrKey
      : fileUrlOrKey;
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return;
  }

  if (provider === 's3') {
    // Extract key from S3 URL: https://bucket.s3.region.amazonaws.com/key -> key
    const key = fileUrlOrKey.includes('.amazonaws.com/')
      ? fileUrlOrKey.split('.amazonaws.com/').pop() || fileUrlOrKey
      : fileUrlOrKey;
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: config.aws_s3_bucket,
        Key: key,
      })
    );
    return;
  }

  if (provider === 'bunnynet') {
    // Extract filename from CDN URL
    const fileName = fileUrlOrKey.includes(config.bunnynet_cdn_url || '')
      ? fileUrlOrKey.split('/').pop() || fileUrlOrKey
      : fileUrlOrKey;
    await axios.delete(
      `https://storage.bunnycdn.com/${config.bunnynet_storage_zone}/${fileName}`,
      {
        headers: {
          AccessKey: config.bunnynet_access_key,
        },
      }
    );
    return;
  }

  if (provider === 'contabo') {
    const contaboClient = new S3Client({
      region: config.contabo_region,
      endpoint: config.contabo_endpoint,
      credentials: {
        accessKeyId: config.contabo_access_key as string,
        secretAccessKey: config.contabo_secret_key as string,
      },
    });
    // Extract key from Contabo URL
    const key = fileUrlOrKey.includes(`/${config.contabo_bucket}/`)
      ? fileUrlOrKey.split(`/${config.contabo_bucket}/`).pop() || fileUrlOrKey
      : fileUrlOrKey;
    await contaboClient.send(
      new DeleteObjectCommand({
        Bucket: config.contabo_bucket,
        Key: key,
      })
    );
    return;
  }

  if (provider === 'cloudinary') {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/cloud/image/upload/v123/quran-uploads/filename
    let publicId = fileUrlOrKey;
    if (fileUrlOrKey.includes('cloudinary.com')) {
      const urlParts = fileUrlOrKey.split('/upload/');
      if (urlParts.length > 1) {
        // Remove version number and get public_id
        publicId = urlParts[1].split('/').slice(1).join('/').split('.')[0];
      }
    }
    await cloudinary.uploader.destroy(publicId);
    return;
  }
};

export const getFileUrl = (fileUrlOrKey: string): string => {
  // Since uploadFile now returns full URLs, we just return the value as-is
  // This function is kept for backward compatibility
  return fileUrlOrKey;
};

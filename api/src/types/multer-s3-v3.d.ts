declare module 'multer-s3-v3' {
  import { S3Client } from '@aws-sdk/client-s3';
  import { Request } from 'express';
  import { StorageEngine } from 'multer';

  interface S3StorageOptions {
    s3: S3Client;
    bucket: string | ((req: Request, file: Express.Multer.File, callback: (error: any, bucket: string) => void) => void);
    key?: (req: Request, file: Express.Multer.File, callback: (error: any, key: string) => void) => void;
    acl?: string | ((req: Request, file: Express.Multer.File, callback: (error: any, acl: string) => void) => void);
    contentType?: ((req: Request, file: Express.Multer.File, callback: (error: any, mime: string, stream: NodeJS.ReadableStream) => void) => void) | any;
    metadata?: (req: Request, file: Express.Multer.File, callback: (error: any, metadata: any) => void) => void;
    cacheControl?: string | ((req: Request, file: Express.Multer.File, callback: (error: any, cacheControl: string) => void) => void);
    serverSideEncryption?: string | ((req: Request, file: Express.Multer.File, callback: (error: any, serverSideEncryption: string) => void) => void);
  }

  interface S3Storage extends StorageEngine {
    AUTO_CONTENT_TYPE: any;
  }

  function multerS3(options: S3StorageOptions): S3Storage;

  export = multerS3;
}

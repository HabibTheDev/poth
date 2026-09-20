import swaggerJsdoc from 'swagger-jsdoc';
import config from './index';

const packageJson = require('../../../package.json');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Maps - Vehicle-Aware Navigation & Road Intelligence API',
    version: packageJson.version,
    description: 'Vehicle-aware navigation, live community road intelligence, fuel/range tracking, trip cost, and community platform API',
    contact: {
      name: 'API Support',
      email: 'support@quranbackend.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Development server',
    },
    {
      url: 'https://api.production.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
    },
    schemas: {
      // User schemas
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clx1234567890' },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          role: {
            type: 'string',
            enum: ['SUPER_ADMIN', 'ADMIN', 'TUTOR', 'STUDENT', 'MODERATOR', 'MANAGER'],
            example: 'STUDENT',
          },
          status: {
            type: 'string',
            enum: ['active', 'blocked', 'pending'],
            example: 'active',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          profile: { $ref: '#/components/schemas/UserProfile' },
        },
      },
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          phone: { type: 'string', example: '+1234567890' },
          address: { type: 'string', example: '123 Main St' },
          bio: { type: 'string', example: 'Software Developer' },
          avatarUrl: { type: 'string', format: 'uri', example: 'https://bucket.s3.amazonaws.com/avatars/user.jpg' },
        },
      },
      // Auth schemas
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', format: 'password', example: 'password123' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['oldPassword', 'newPassword'],
        properties: {
          oldPassword: { type: 'string', format: 'password' },
          newPassword: { type: 'string', format: 'password', minLength: 6 },
        },
      },
      ForgetPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['id', 'newPassword'],
        properties: {
          id: { type: 'string' },
          newPassword: { type: 'string', format: 'password', minLength: 6 },
        },
      },
      // Chat schemas
      ChatRoom: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clx1234567890' },
          name: { type: 'string', example: 'General Chat' },
          isGroup: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
          members: {
            type: 'array',
            items: { $ref: '#/components/schemas/ChatRoomMember' },
          },
        },
      },
      ChatRoomMember: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          chatRoomId: { type: 'string' },
          senderId: { type: 'string' },
          receiverId: { type: 'string', nullable: true },
          content: { type: 'string', example: 'Hello, how are you?' },
          messageType: {
            type: 'string',
            enum: ['text', 'image', 'file', 'audio', 'video'],
            example: 'text',
          },
          fileUrl: { type: 'string', format: 'uri', nullable: true },
          fileName: { type: 'string', nullable: true },
          fileSize: { type: 'integer', nullable: true },
          isRead: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      FileUploadResponse: {
        type: 'object',
        properties: {
          fileUrl: { type: 'string', format: 'uri', example: 'https://bucket.s3.amazonaws.com/chat-files/file.pdf' },
          fileName: { type: 'string', example: 'document.pdf' },
          fileSize: { type: 'integer', example: 524288 },
          mimeType: { type: 'string', example: 'application/pdf' },
        },
      },
      // Standard response schemas
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Operation successful' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'Error message' },
          errorMessages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 100 },
          totalPages: { type: 'integer', example: 10 },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              statusCode: 401,
              message: 'You are not authorized',
              errorMessages: [],
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              statusCode: 403,
              message: 'Forbidden access',
              errorMessages: [],
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              statusCode: 404,
              message: 'Not found',
              errorMessages: [],
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              statusCode: 400,
              message: 'Validation error',
              errorMessages: [
                { path: 'email', message: 'Invalid email format' },
              ],
            },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'User', description: 'User management endpoints' },
    { name: 'Chat', description: 'Chat and file upload endpoints' },
  ],
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: [
    './src/app/swagger/*.ts',  // Swagger annotations in separate files
    './src/app/routes/*.ts',    // Route aggregators
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

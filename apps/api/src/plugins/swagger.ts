import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import fp from 'fastify-plugin';

export default fp(
  async (fastify: FastifyTypeBox) => {
    fastify.log.debug('Registering Swagger plugin');

    await fastify.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'BookWise API',
          description: 'API documentation for BookWise - a library management system',
          version: '1.0.0'
        },
        tags: [
          { name: 'Auth', description: 'Sign up, sign in, refresh, and sign out flows' },
          { name: 'User', description: 'Authenticated user profile and password management' },
          { name: 'Author', description: 'Public author lookup by slug' },
          { name: 'Book', description: 'Public book catalog access' },
          { name: 'Category', description: 'Public category listing' },
          { name: 'Publisher', description: 'Public publisher lookup by slug' },
          { name: 'Rating', description: 'Public book rating endpoints' },
          { name: 'Loan', description: 'Public-facing loan-related operations (if any)' },
          { name: 'Admin', description: 'Admin-only management endpoints' },
          { name: 'Staff/Author', description: 'Staff CRUD and search for authors' },
          { name: 'Staff/Book', description: 'Staff CRUD and listing for books' },
          { name: 'Staff/BookClone', description: 'Staff CRUD and availability management for book copies' },
          { name: 'Staff/Category', description: 'Staff CRUD and listing for categories' },
          { name: 'Staff/Publisher', description: 'Staff CRUD and listing for publishers' },
          { name: 'Staff/Loan', description: 'Staff loan creation and tracking' },
          { name: 'Staff/Location', description: 'Staff management of library locations' }
        ],
        components: {
          securitySchemes: {
            JWT: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              summary: 'JWT based authentication',
              description: 'Enter your JWT token to authorize requests'
            }
          }
        }
      }
    });

    await fastify.register(fastifySwaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list'
      }
    });
  },
  {
    name: 'Swagger'
  }
);

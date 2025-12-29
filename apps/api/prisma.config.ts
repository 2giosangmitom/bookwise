import { defineConfig, env } from 'prisma/config';
import process from 'node:process';

const isTest = process.env.NODE_ENV === 'test';

if (isTest) {
  process.loadEnvFile('.env.test');
} else {
  process.loadEnvFile('.env');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL')
  }
});

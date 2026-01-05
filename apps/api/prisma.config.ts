import { defineConfig, env } from 'prisma/config';

// Gracefully handle missing DATABASE_URL in certain environments
let DATABASE_URL;
try {
  DATABASE_URL = env('DATABASE_URL');
} catch {
  // No action needed
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: DATABASE_URL
  }
});

import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import process from 'node:process';

const isTest = process.env.NODE_ENV === 'test';

if (isTest) {
  process.loadEnvFile('.env.test');
} else {
  process.loadEnvFile('.env');
}

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    reporters: 'tree',
    projects: [
      {
        extends: true,
        test: {
          name: 'Unit',
          include: ['tests/unit/**/*.test.ts']
        }
      },
      {
        extends: true,
        test: {
          name: 'Integration',
          include: ['tests/integration/**/*.test.ts'],
          pool: 'threads',
          globalSetup: './tests/integration/setup/globalSetup.ts'
        }
      }
    ],
    coverage: {
      exclude: ['autohooks.ts', 'src/plugins/**', 'src/generated/**', 'src/*.ts', 'src/config/**', 'tests/*/helpers/**']
    }
  }
});

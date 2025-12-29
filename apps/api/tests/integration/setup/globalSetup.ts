import { execSync } from 'node:child_process';
import { build, users } from '../helpers/build';

export default async function globalSetup() {
  console.log('Setting up integration test database...');

  // Run database migrations
  execSync('pnpm prisma:migrate', { stdio: 'inherit' });

  // Create some users
  const app = await build();
  for (const user of users) {
    console.log(`Creating user: ${user.email}`);
    console.log(`Password: ${user.password}`);
    await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: user
    });
  }
  console.log('All users created.');

  // Promote the first user to ADMIN
  console.log('Setting up ADMIN user...');
  await app.prisma.user.update({
    where: { email: users[0].email },
    data: { role: 'ADMIN' }
  });
  console.log(`Admin user setup complete: ${users[0].email}`);

  console.log('Setting up LIBRARIAN users...');
  for (let i = 1; i <= 3; i++) {
    await app.prisma.user.update({
      where: { email: users[i].email },
      data: { role: 'LIBRARIAN' }
    });
    console.log(`Librarian user setup complete: ${users[i].email}`);
  }

  // Close the app instance
  console.log('Integration test database setup complete.');

  return async () => {
    console.log('Tearing down integration test database...');

    // Drop the test database
    execSync('pnpm prisma migrate reset --force', { stdio: 'inherit' });
    await app.redis.flushall();
    await app.close();

    console.log('Integration test database torn down.');
  };
}

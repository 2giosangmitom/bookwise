import fp from 'fastify-plugin';
import { S3Client, ListBucketsCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import type { envType } from '@/config/envSchema';
import { asValue } from 'awilix';

export default fp(
  async (fastify, opts: envType) => {
    fastify.log.debug('Registering S3 plugin');

    const buckets = ['bookwise-books', 'bookwise-publishers', 'bookwise-authors'];
    const s3Client = new S3Client({
      endpoint: opts.RUSTFS_ENDPOINT,
      region: 'us-east-1',
      credentials: {
        accessKeyId: opts.RUSTFS_ACCESS_KEY,
        secretAccessKey: opts.RUSTFS_SECRET_KEY
      },
      forcePathStyle: true // Must be enabled for RustFS compatibility
    });

    const listBucketsCommand = new ListBucketsCommand({});
    const bucketsList = await s3Client.send(listBucketsCommand);
    if (!bucketsList.Buckets) {
      throw new Error('Failed to list S3 buckets');
    }

    const bucketsNames = bucketsList.Buckets.map((bucketEntry) => {
      return bucketEntry.Name;
    });

    const bucketsToCreate = buckets.filter((bucketEntry) => {
      return !bucketsNames.includes(bucketEntry);
    });

    for (const bucket of bucketsToCreate) {
      const createBucketCommand = new CreateBucketCommand({ Bucket: bucket });
      await s3Client.send(createBucketCommand);
    }

    fastify.diContainer.register('s3Client', asValue(s3Client));

    fastify.addHook('onClose', (_, done) => {
      s3Client.destroy();
      done();
    });
  },
  {
    name: 'S3'
  }
);

import { Global, Module } from "@nestjs/common";
import { ConfigurableModuleBuilder, OnModuleInit, Injectable, Inject, Logger } from "@nestjs/common";
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  S3Client,
  S3ClientConfig,
} from "@aws-sdk/client-s3";

export const S3ClientSymbol = Symbol("S3_CLIENT");

export const Buckets = {
  books: "bookwise-books",
  publishers: "bookwise-publishers",
  authors: "bookwise-authors",
};

const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } = new ConfigurableModuleBuilder<S3ClientConfig>()
  .setClassMethodName("register")
  .build();

@Injectable()
export class S3BucketInitializer implements OnModuleInit {
  private readonly logger = new Logger(S3BucketInitializer.name);

  constructor(
    @Inject(S3ClientSymbol)
    private readonly s3: S3Client,
  ) {}

  async onModuleInit() {
    for (const bucket of Object.values(Buckets)) {
      await this.ensureBucket(bucket);
    }
  }

  private async ensureBucket(bucket: string) {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: bucket }));
      this.logger.log(`Bucket "${bucket}" already exists`);
    } catch {
      this.logger.warn(`Creating bucket "${bucket}"`);
      await this.s3.send(new CreateBucketCommand({ Bucket: bucket }));

      await this.s3.send(
        new PutBucketPolicyCommand({
          Bucket: bucket,
          Policy: JSON.stringify({
            ID: "",
            Version: "2012-10-17",
            Statement: [
              {
                Sid: "",
                Effect: "Allow",
                Principal: { AWS: ["*"] },
                Action: ["s3:GetObject"],
                Resource: [`arn:aws:s3:::${bucket}/*`],
              },
              {
                Sid: "",
                Effect: "Allow",
                Principal: { AWS: ["arn:aws:iam::*:root"] },
                Action: ["s3:DeleteObject", "s3:DeleteObjectTagging", "s3:PutObject", "s3:PutObjectTagging"],
                Resource: [`arn:aws:s3:::${bucket}/*`],
              },
            ],
          }),
        }),
      );
    }
  }
}

@Global()
@Module({
  providers: [
    {
      provide: S3ClientSymbol,
      useFactory: (options: S3ClientConfig) => {
        return new S3Client(options);
      },
      inject: [MODULE_OPTIONS_TOKEN],
    },
    S3BucketInitializer,
  ],
  exports: [S3ClientSymbol],
})
export class S3UtilsModule extends ConfigurableModuleClass {}

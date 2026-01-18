import { MigrationInterface, QueryRunner } from "typeorm";

export class ImprSession1768727469902 implements MigrationInterface {
  name = "ImprSession1768727469902";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "session" DROP COLUMN "device"
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD "refreshTokenHash" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD CONSTRAINT "UQ_ff3907da35cc76361715c820ca3" UNIQUE ("refreshTokenHash")
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD "userAgent" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD "deviceName" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD "os" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD "browser" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD "revoked" boolean NOT NULL DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD "expiresAt" TIMESTAMP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11"
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP COLUMN "id"
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id")
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP COLUMN "ipAddress"
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD "ipAddress" character varying(45) NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "session" DROP COLUMN "ipAddress"
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD "ipAddress" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11"
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP COLUMN "id"
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD "id" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id")
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP COLUMN "createdAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP COLUMN "expiresAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP COLUMN "revoked"
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP COLUMN "browser"
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP COLUMN "os"
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP COLUMN "deviceName"
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP COLUMN "userAgent"
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP CONSTRAINT "UQ_ff3907da35cc76361715c820ca3"
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP COLUMN "refreshTokenHash"
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD "device" character varying NOT NULL
        `);
  }
}

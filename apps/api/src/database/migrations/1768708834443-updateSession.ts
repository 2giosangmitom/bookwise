import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSession1768708834443 implements MigrationInterface {
  name = "UpdateSession1768708834443";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "session" DROP COLUMN "latitude"
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP COLUMN "longitude"
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD "ipAddress" character varying NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "session" DROP COLUMN "ipAddress"
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD "longitude" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD "latitude" character varying NOT NULL
        `);
  }
}

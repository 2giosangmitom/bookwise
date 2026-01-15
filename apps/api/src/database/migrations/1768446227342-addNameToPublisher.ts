import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNameToPublisher1768446227342 implements MigrationInterface {
  name = "AddNameToPublisher1768446227342";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "publisher"
            ADD "name" character varying NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "publisher" DROP COLUMN "name"
        `);
  }
}

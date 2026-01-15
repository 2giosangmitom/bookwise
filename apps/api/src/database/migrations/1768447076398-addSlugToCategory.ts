import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSlugToCategory1768447076398 implements MigrationInterface {
  name = "AddSlugToCategory1768447076398";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "category"
            ADD "slug" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "category"
            ADD CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70" UNIQUE ("slug")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "category" DROP CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70"
        `);
    await queryRunner.query(`
            ALTER TABLE "category" DROP COLUMN "slug"
        `);
  }
}

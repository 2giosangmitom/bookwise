import { MigrationInterface, QueryRunner } from "typeorm";

export class AllowNullPhotos1768224069405 implements MigrationInterface {
  name = "AllowNullPhotos1768224069405";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "photoFileName" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "author"
            ALTER COLUMN "photoFileName" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "publisher"
            ALTER COLUMN "photoFileName" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "book"
            ALTER COLUMN "photoFileName" DROP NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "book"
            ALTER COLUMN "photoFileName"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "publisher"
            ALTER COLUMN "photoFileName"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "author"
            ALTER COLUMN "photoFileName"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "photoFileName"
            SET NOT NULL
        `);
  }
}

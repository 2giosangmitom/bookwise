import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBookStatus1768573434649 implements MigrationInterface {
  name = "AddBookStatus1768573434649";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."book_copy_status_enum" AS ENUM('AVAILABLE', 'BORROWED')
        `);
    await queryRunner.query(`
            ALTER TABLE "book_copy"
            ADD "status" "public"."book_copy_status_enum" NOT NULL DEFAULT 'AVAILABLE'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "book_copy" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."book_copy_status_enum"
        `);
  }
}

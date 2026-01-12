import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEnums1768200010669 implements MigrationInterface {
  name = "UpdateEnums1768200010669";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."loan_status_enum" AS ENUM('BORROWED', 'RETURNED', 'OVERDUE')
        `);
    await queryRunner.query(`
            ALTER TABLE "loan"
            ADD "status" "public"."loan_status_enum" NOT NULL DEFAULT 'BORROWED'
        `);
    await queryRunner.query(`
            ALTER TABLE "book_copy" DROP CONSTRAINT "FK_8639f9a7d3293fad88c8fd3c43d"
        `);
    await queryRunner.query(`
            ALTER TABLE "book_copy"
            ALTER COLUMN "bookId"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "book_copy"
            ADD CONSTRAINT "FK_8639f9a7d3293fad88c8fd3c43d" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "book_copy" DROP CONSTRAINT "FK_8639f9a7d3293fad88c8fd3c43d"
        `);
    await queryRunner.query(`
            ALTER TABLE "book_copy"
            ALTER COLUMN "bookId" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "book_copy"
            ADD CONSTRAINT "FK_8639f9a7d3293fad88c8fd3c43d" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "loan" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."loan_status_enum"
        `);
  }
}

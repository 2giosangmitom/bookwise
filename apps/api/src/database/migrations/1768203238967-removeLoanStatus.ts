import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveLoanStatus1768203238967 implements MigrationInterface {
  name = "RemoveLoanStatus1768203238967";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "loan"
            ALTER COLUMN "returnDate" DROP NOT NULL
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
            ALTER TABLE "loan"
            ALTER COLUMN "returnDate"
            SET NOT NULL
        `);
  }
}

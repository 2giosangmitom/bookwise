import { MigrationInterface, QueryRunner } from "typeorm";

export class ReturnDate1768143821938 implements MigrationInterface {
  name = "ReturnDate1768143821938";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "loan"
            ADD "returnDate" date NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "loan" DROP COLUMN "returnDate"
        `);
  }
}

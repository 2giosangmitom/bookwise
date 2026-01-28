import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteReservationTime1769610528690 implements MigrationInterface {
  name = "DeleteReservationTime1769610528690";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "reservation" DROP COLUMN "time"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "reservation"
            ADD "time" TIMESTAMP WITH TIME ZONE NOT NULL
        `);
  }
}

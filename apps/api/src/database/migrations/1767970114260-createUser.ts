import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUser1767970114260 implements MigrationInterface {
  name = "CreateUser1767970114260";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "user" (
                "userId" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "email" character varying NOT NULL,
                "photoFileName" character varying NOT NULL,
                CONSTRAINT "PK_d72ea127f30e21753c9e229891e" PRIMARY KEY ("userId")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "user"
        `);
  }
}

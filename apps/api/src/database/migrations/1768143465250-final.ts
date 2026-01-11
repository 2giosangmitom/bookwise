import { MigrationInterface, QueryRunner } from "typeorm";

export class Final1768143465250 implements MigrationInterface {
  name = "Final1768143465250";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "session" (
                "id" character varying NOT NULL,
                "device" character varying NOT NULL,
                "latitude" character varying NOT NULL,
                "longitude" character varying NOT NULL,
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "author" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "biography" text NOT NULL,
                "dateOfBirth" date NOT NULL,
                "dateOfDeath" date NOT NULL,
                "slug" character varying NOT NULL,
                "photoFileName" character varying NOT NULL,
                CONSTRAINT "UQ_6ee7ef69a7694fea87382052fed" UNIQUE ("slug"),
                CONSTRAINT "PK_5a0e79799d372fe56f2f3fa6871" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "category" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "publisher" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "description" text NOT NULL,
                "website" character varying NOT NULL,
                "slug" character varying NOT NULL,
                "photoFileName" character varying NOT NULL,
                CONSTRAINT "UQ_e8e355d9e8852db144b49d5914e" UNIQUE ("slug"),
                CONSTRAINT "PK_70a5936b43177f76161724da3e6" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "book" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "photoFileName" character varying NOT NULL,
                "isbn" character varying NOT NULL,
                "publishedDate" date NOT NULL,
                CONSTRAINT "UQ_bd183604b9c828c0bdd92cafab7" UNIQUE ("isbn"),
                CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "reservation" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "time" TIMESTAMP NOT NULL,
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_48b1f9922368359ab88e8bfa525" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."book_copy_condition_enum" AS ENUM('NEW', 'GOOD', 'WORN', 'DAMAGED', 'LOST')
        `);
    await queryRunner.query(`
            CREATE TABLE "book_copy" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "barcode" character varying NOT NULL,
                "condition" "public"."book_copy_condition_enum" NOT NULL DEFAULT 'NEW',
                "bookId" uuid,
                CONSTRAINT "UQ_cae499666e06981a66a420f7d93" UNIQUE ("barcode"),
                CONSTRAINT "PK_ef16f7a75bc656c5486264959bb" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "loan" (
                "id" SERIAL NOT NULL,
                "loanDate" date NOT NULL,
                "dueDate" date NOT NULL,
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_4ceda725a323d254a5fd48bf95f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "author_books_book" (
                "authorId" uuid NOT NULL,
                "bookId" uuid NOT NULL,
                CONSTRAINT "PK_6b6bf224c7ce78773e95bded3f2" PRIMARY KEY ("authorId", "bookId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_e9ac29df6d093aa0b8079f1d15" ON "author_books_book" ("authorId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_34342925729041ac5301b289a9" ON "author_books_book" ("bookId")
        `);
    await queryRunner.query(`
            CREATE TABLE "category_books_book" (
                "categoryId" uuid NOT NULL,
                "bookId" uuid NOT NULL,
                CONSTRAINT "PK_57f94e9aea63429e385a997c5b2" PRIMARY KEY ("categoryId", "bookId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_c91e15c7afdefb644e19eefc06" ON "category_books_book" ("categoryId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b2ac429a6afcd2495c59b27e84" ON "category_books_book" ("bookId")
        `);
    await queryRunner.query(`
            CREATE TABLE "publisher_books_book" (
                "publisherId" uuid NOT NULL,
                "bookId" uuid NOT NULL,
                CONSTRAINT "PK_0b5348859e3a669a1d92411fe37" PRIMARY KEY ("publisherId", "bookId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_045f68ababf290d56c7b4181f8" ON "publisher_books_book" ("publisherId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_c360a003ad0d0187f1bf813b56" ON "publisher_books_book" ("bookId")
        `);
    await queryRunner.query(`
            CREATE TABLE "reservation_books_book" (
                "reservationId" uuid NOT NULL,
                "bookId" uuid NOT NULL,
                CONSTRAINT "PK_ba49085ad1b9f5a575c38ad2800" PRIMARY KEY ("reservationId", "bookId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_ad697aa5d57f46f32b196ae026" ON "reservation_books_book" ("reservationId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_e5c25f24383fc4182a54aeafd7" ON "reservation_books_book" ("bookId")
        `);
    await queryRunner.query(`
            CREATE TABLE "loan_book_copies_book_copy" (
                "loanId" integer NOT NULL,
                "bookCopyId" uuid NOT NULL,
                CONSTRAINT "PK_15cd5bb3177f8cf8a155c345231" PRIMARY KEY ("loanId", "bookCopyId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_1dee19fccd89862f883b3b3ebc" ON "loan_book_copies_book_copy" ("loanId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_6e7c3ae4c03171887f3e0156ca" ON "loan_book_copies_book_copy" ("bookCopyId")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM('ADMIN', 'LIBRARIAN', 'MEMBER')
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "role" "public"."user_role_enum" NOT NULL DEFAULT 'MEMBER'
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."account_status_enum" AS ENUM('ACTIVE', 'BANNED')
        `);
    await queryRunner.query(`
            ALTER TABLE "account"
            ADD "status" "public"."account_status_enum" NOT NULL DEFAULT 'ACTIVE'
        `);
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reservation"
            ADD CONSTRAINT "FK_529dceb01ef681127fef04d755d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "book_copy"
            ADD CONSTRAINT "FK_8639f9a7d3293fad88c8fd3c43d" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "loan"
            ADD CONSTRAINT "FK_ef7a63b4c4f0edd90e389edb103" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "author_books_book"
            ADD CONSTRAINT "FK_e9ac29df6d093aa0b8079f1d151" FOREIGN KEY ("authorId") REFERENCES "author"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "author_books_book"
            ADD CONSTRAINT "FK_34342925729041ac5301b289a9a" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "category_books_book"
            ADD CONSTRAINT "FK_c91e15c7afdefb644e19eefc066" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "category_books_book"
            ADD CONSTRAINT "FK_b2ac429a6afcd2495c59b27e845" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "publisher_books_book"
            ADD CONSTRAINT "FK_045f68ababf290d56c7b4181f86" FOREIGN KEY ("publisherId") REFERENCES "publisher"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "publisher_books_book"
            ADD CONSTRAINT "FK_c360a003ad0d0187f1bf813b565" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "reservation_books_book"
            ADD CONSTRAINT "FK_ad697aa5d57f46f32b196ae026f" FOREIGN KEY ("reservationId") REFERENCES "reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "reservation_books_book"
            ADD CONSTRAINT "FK_e5c25f24383fc4182a54aeafd73" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "loan_book_copies_book_copy"
            ADD CONSTRAINT "FK_1dee19fccd89862f883b3b3ebc6" FOREIGN KEY ("loanId") REFERENCES "loan"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "loan_book_copies_book_copy"
            ADD CONSTRAINT "FK_6e7c3ae4c03171887f3e0156ca0" FOREIGN KEY ("bookCopyId") REFERENCES "book_copy"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "loan_book_copies_book_copy" DROP CONSTRAINT "FK_6e7c3ae4c03171887f3e0156ca0"
        `);
    await queryRunner.query(`
            ALTER TABLE "loan_book_copies_book_copy" DROP CONSTRAINT "FK_1dee19fccd89862f883b3b3ebc6"
        `);
    await queryRunner.query(`
            ALTER TABLE "reservation_books_book" DROP CONSTRAINT "FK_e5c25f24383fc4182a54aeafd73"
        `);
    await queryRunner.query(`
            ALTER TABLE "reservation_books_book" DROP CONSTRAINT "FK_ad697aa5d57f46f32b196ae026f"
        `);
    await queryRunner.query(`
            ALTER TABLE "publisher_books_book" DROP CONSTRAINT "FK_c360a003ad0d0187f1bf813b565"
        `);
    await queryRunner.query(`
            ALTER TABLE "publisher_books_book" DROP CONSTRAINT "FK_045f68ababf290d56c7b4181f86"
        `);
    await queryRunner.query(`
            ALTER TABLE "category_books_book" DROP CONSTRAINT "FK_b2ac429a6afcd2495c59b27e845"
        `);
    await queryRunner.query(`
            ALTER TABLE "category_books_book" DROP CONSTRAINT "FK_c91e15c7afdefb644e19eefc066"
        `);
    await queryRunner.query(`
            ALTER TABLE "author_books_book" DROP CONSTRAINT "FK_34342925729041ac5301b289a9a"
        `);
    await queryRunner.query(`
            ALTER TABLE "author_books_book" DROP CONSTRAINT "FK_e9ac29df6d093aa0b8079f1d151"
        `);
    await queryRunner.query(`
            ALTER TABLE "loan" DROP CONSTRAINT "FK_ef7a63b4c4f0edd90e389edb103"
        `);
    await queryRunner.query(`
            ALTER TABLE "book_copy" DROP CONSTRAINT "FK_8639f9a7d3293fad88c8fd3c43d"
        `);
    await queryRunner.query(`
            ALTER TABLE "reservation" DROP CONSTRAINT "FK_529dceb01ef681127fef04d755d"
        `);
    await queryRunner.query(`
            ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"
        `);
    await queryRunner.query(`
            ALTER TABLE "account" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."account_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "role"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."user_role_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_6e7c3ae4c03171887f3e0156ca"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_1dee19fccd89862f883b3b3ebc"
        `);
    await queryRunner.query(`
            DROP TABLE "loan_book_copies_book_copy"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_e5c25f24383fc4182a54aeafd7"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ad697aa5d57f46f32b196ae026"
        `);
    await queryRunner.query(`
            DROP TABLE "reservation_books_book"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_c360a003ad0d0187f1bf813b56"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_045f68ababf290d56c7b4181f8"
        `);
    await queryRunner.query(`
            DROP TABLE "publisher_books_book"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b2ac429a6afcd2495c59b27e84"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_c91e15c7afdefb644e19eefc06"
        `);
    await queryRunner.query(`
            DROP TABLE "category_books_book"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_34342925729041ac5301b289a9"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_e9ac29df6d093aa0b8079f1d15"
        `);
    await queryRunner.query(`
            DROP TABLE "author_books_book"
        `);
    await queryRunner.query(`
            DROP TABLE "loan"
        `);
    await queryRunner.query(`
            DROP TABLE "book_copy"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."book_copy_condition_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "reservation"
        `);
    await queryRunner.query(`
            DROP TABLE "book"
        `);
    await queryRunner.query(`
            DROP TABLE "publisher"
        `);
    await queryRunner.query(`
            DROP TABLE "category"
        `);
    await queryRunner.query(`
            DROP TABLE "author"
        `);
    await queryRunner.query(`
            DROP TABLE "session"
        `);
  }
}

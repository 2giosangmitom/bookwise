import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, ManyToMany, type Relation } from "typeorm";
import { Book } from "./book";
import { Loan } from "./loan";
import { BookCondition, BookStatus } from "@bookwise/shared";

@Entity()
export class BookCopy {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Book, (book) => book.id, {
    nullable: false,
    onDelete: "CASCADE",
  })
  book!: Relation<Book>;

  @Column({
    unique: true,
  })
  barcode!: string;

  @Column("enum", { enum: BookStatus, default: BookStatus.AVAILABLE })
  status!: BookStatus;

  @Column({
    type: "enum",
    enum: BookCondition,
    default: BookCondition.NEW,
  })
  condition!: BookCondition;

  @ManyToMany(() => Loan, (loan) => loan.id, {
    nullable: false,
  })
  loans!: Relation<Loan[]>;
}

import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { Book } from "./book";
import { Loan } from "./loan";
import { BookCondition } from "@bookwise/shared";

@Entity()
export class BookCopy {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Book, (book) => book.id, {
    nullable: false,
    onDelete: "CASCADE",
  })
  book!: Book;

  @Column({
    unique: true,
  })
  barcode!: string;

  @Column({
    type: "enum",
    enum: BookCondition,
    default: BookCondition.NEW,
  })
  condition!: BookCondition;

  @ManyToMany(() => Loan, (loan) => loan.id, {
    nullable: false,
  })
  loans!: Loan;
}

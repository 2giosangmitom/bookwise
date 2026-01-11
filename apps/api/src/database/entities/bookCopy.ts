import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { Book } from "./book";
import { Loan } from "./loan";

export enum BookCondition {
  NEW = "NEW",
  GOOD = "GOOD",
  WORN = "WORN",
  DAMAGED = "DAMAGED",
  LOST = "LOST",
}

@Entity()
export class BookCopy {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Book, (book) => book.id, {
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

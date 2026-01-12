import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, ManyToMany, type Relation } from "typeorm";
import { Book } from "./book.js";
import { Loan } from "./loan.js";
import { BookCondition } from "@bookwise/shared/enums";

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

  @Column({
    type: "enum",
    enum: BookCondition,
    default: BookCondition.NEW,
  })
  condition!: BookCondition;

  @ManyToMany(() => Loan, (loan) => loan.id, {
    nullable: false,
  })
  loans!: Relation<Loan>;
}

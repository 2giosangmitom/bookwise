import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, JoinTable, type Relation } from "typeorm";
import { BookCopy } from "./bookCopy.js";
import { User } from "./user.js";
import { LoanStatus } from "@bookwise/shared/enums";

@Entity()
export class Loan {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column({
    type: "date",
  })
  loanDate!: Date;

  @Column({
    type: "date",
  })
  dueDate!: Date;

  @Column({
    type: "date",
  })
  returnDate!: Date;

  @ManyToMany(() => BookCopy, (bookCopy) => bookCopy.id, {
    nullable: false,
  })
  @JoinTable()
  bookCopies!: Relation<BookCopy[]>;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
  })
  user!: Relation<User>;

  @Column({
    type: "enum",
    enum: LoanStatus,
    default: LoanStatus.BORROWED,
  })
  status!: LoanStatus;
}

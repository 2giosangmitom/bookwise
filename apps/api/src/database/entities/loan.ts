import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, JoinTable, type Relation } from "typeorm";
import { BookCopy } from "./bookCopy";
import { User } from "./user";

@Entity()
export class Loan {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column({ type: "date" })
  loanDate!: string;

  @Column({ type: "date" })
  dueDate!: string;

  @Column("date", { nullable: true })
  returnDate!: string;

  @ManyToMany(() => BookCopy, (bookCopy) => bookCopy.id, {
    nullable: false,
  })
  @JoinTable()
  bookCopies!: Relation<BookCopy[]>;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
  })
  user!: Relation<User>;
}

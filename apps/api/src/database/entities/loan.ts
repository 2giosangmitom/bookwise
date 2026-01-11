import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, JoinTable } from "typeorm";
import { BookCopy } from "./bookCopy";
import { User } from "./user";

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
  bookCopies!: BookCopy[];

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
  })
  user!: User;
}

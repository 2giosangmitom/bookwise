import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { User } from "./user";
import { Book } from "./book";

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id!: string;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
    onDelete: "CASCADE",
  })
  user!: User;

  @Column({
    type: "timestamp",
  })
  time!: Date;

  @ManyToMany(() => Book, (book) => book.id, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinTable()
  books!: Book[];
}

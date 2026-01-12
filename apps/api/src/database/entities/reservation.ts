import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, type Relation } from "typeorm";
import { User } from "./user.js";
import { Book } from "./book.js";

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
    onDelete: "CASCADE",
  })
  user!: Relation<User>;

  @Column({
    type: "timestamp",
  })
  time!: Date;

  @ManyToMany(() => Book, (book) => book.id, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinTable()
  books!: Relation<Book[]>;
}

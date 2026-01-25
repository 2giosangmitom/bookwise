import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  type Relation,
} from "typeorm";
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
  user!: Relation<User>;

  @Column({
    type: "timestamp",
  })
  time!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToMany(() => Book, (book) => book.id, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinTable()
  books!: Relation<Book[]>;
}

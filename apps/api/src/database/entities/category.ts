import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, type Relation } from "typeorm";
import { Book } from "./book";

@Entity()
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({
    unique: true,
  })
  slug!: string;

  @ManyToMany(() => Book, (book) => book.id, {
    nullable: false,
  })
  @JoinTable()
  books!: Relation<Book[]>;
}

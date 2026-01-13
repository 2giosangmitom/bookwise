import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm";
import { Book } from "./book";

@Entity()
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @ManyToMany(() => Book, (book) => book.id, {
    nullable: false,
  })
  @JoinTable()
  books!: Book[];
}

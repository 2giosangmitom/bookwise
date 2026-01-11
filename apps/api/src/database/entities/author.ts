import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm";
import { Book } from "./book";

@Entity()
export class Author {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({
    type: "text",
  })
  biography!: string;

  @Column({
    type: "date",
  })
  dateOfBirth!: Date;

  @Column({
    type: "date",
  })
  dateOfDeath!: Date;

  @Column({
    unique: true,
  })
  slug!: string;

  @Column()
  photoFileName!: string;

  @ManyToMany(() => Book, (book) => book.id, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinTable()
  books!: Book;
}

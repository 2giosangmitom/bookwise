import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, type Relation } from "typeorm";
import { Book } from "./book.js";

@Entity()
export class Author {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column("text")
  biography!: string;

  @Column("date")
  dateOfBirth!: Date;

  @Column("date", {
    nullable: true,
  })
  dateOfDeath!: Date | null;

  @Column({
    unique: true,
  })
  slug!: string;

  @Column({
    type: String,
    nullable: true,
  })
  photoFileName!: string | null;

  @ManyToMany(() => Book, (book) => book.id, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinTable()
  books!: Relation<Book>;
}

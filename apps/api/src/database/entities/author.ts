import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, type Relation } from "typeorm";
import { Book } from "./book";

@Entity()
export class Author {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { length: 100 })
  name!: string;

  @Column("text")
  biography!: string;

  @Column("date")
  dateOfBirth!: string;

  @Column("date", {
    nullable: true,
  })
  dateOfDeath!: string | null;

  @Column("varchar", { unique: true, length: 10 })
  slug!: string;

  @Column("varchar", { nullable: true })
  photoFileName!: string | null;

  @ManyToMany(() => Book, (book) => book.id, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinTable()
  books!: Relation<Book[]>;
}

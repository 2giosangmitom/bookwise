import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm";
import { Book } from "./book";

@Entity()
export class Publisher {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "text",
  })
  description!: string;

  @Column()
  website!: string;

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
    nullable: false,
  })
  @JoinTable()
  books!: Book[];
}

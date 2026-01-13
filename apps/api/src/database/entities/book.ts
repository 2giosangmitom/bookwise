import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { Reservation } from "./reservation";
import { Author } from "./author";
import { Category } from "./category";
import { Publisher } from "./publisher";

@Entity()
export class Book {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({
    type: "text",
  })
  description!: string;

  @Column({
    type: String,
    nullable: true,
  })
  photoFileName!: string | null;

  @Column({
    unique: true,
  })
  isbn!: string;

  @Column({
    type: "date",
  })
  publishedDate!: Date;

  @ManyToMany(() => Reservation, (reservation) => reservation.id, {
    nullable: false,
  })
  reservations!: Reservation[];

  @ManyToMany(() => Author, (author) => author.id, {
    nullable: false,
  })
  authors!: Author[];

  @ManyToMany(() => Category, (category) => category.id, {
    nullable: false,
  })
  categories!: Category[];

  @ManyToMany(() => Publisher, (publisher) => publisher.id, {
    nullable: false,
  })
  publishers!: Publisher[];
}

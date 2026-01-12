import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, type Relation } from "typeorm";
import { Reservation } from "./reservation.js";
import { Author } from "./author.js";
import { Category } from "./category.js";
import { Publisher } from "./publisher.js";

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

  @Column()
  photoFileName!: string;

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
  reservations!: Relation<Reservation[]>;

  @ManyToMany(() => Author, (author) => author.id, {
    nullable: false,
  })
  authors!: Relation<Author[]>;

  @ManyToMany(() => Category, (category) => category.id, {
    nullable: false,
  })
  categories!: Relation<Category[]>;

  @ManyToMany(() => Publisher, (publisher) => publisher.id, {
    nullable: false,
  })
  publishers!: Relation<Publisher[]>;
}

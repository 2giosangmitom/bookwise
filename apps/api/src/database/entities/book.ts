import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, type Relation } from "typeorm";
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

  @Column("text")
  description!: string;

  @Column("varchar", { nullable: true })
  photoFileName!: string | null;

  @Column({ unique: true })
  isbn!: string;

  @Column({ type: "date" })
  publishedDate!: string;

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

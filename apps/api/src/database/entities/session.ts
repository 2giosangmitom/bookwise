import { Column, Entity, ManyToOne, PrimaryColumn, type Relation } from "typeorm";
import { User } from "./user.js";

@Entity()
export class Session {
  @PrimaryColumn()
  id!: string; // refresh token id

  @Column()
  device!: string;

  @Column()
  latitude!: string;

  @Column()
  longitude!: string;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
    onDelete: "CASCADE",
  })
  user!: Relation<User>;
}

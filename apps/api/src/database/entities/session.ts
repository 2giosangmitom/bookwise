import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user";

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
  user!: User;
}

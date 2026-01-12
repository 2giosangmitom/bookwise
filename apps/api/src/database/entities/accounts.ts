import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { User } from "./user.js";
import { AccountStatus } from "@bookwise/shared/enums";

@Entity()
export class Account {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: "CASCADE",
    nullable: false,
  })
  user!: Relation<User>;

  @Column()
  passwordHash!: string;

  @Column()
  passwordSalt!: string;

  @Column({
    type: "enum",
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status!: AccountStatus;
}

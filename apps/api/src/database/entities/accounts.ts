import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

enum AccountStatus {
  ACTIVE = "ACTIVE",
  BANNED = "BANNED",
}

@Entity()
export class Account {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: "CASCADE",
    nullable: false,
  })
  user!: User;

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

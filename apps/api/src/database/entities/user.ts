import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "@bookwise/shared";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  firstName!: string;

  @Column({
    type: String,
    nullable: true,
  })
  lastName!: string | null;

  @Column({
    unique: true,
  })
  email!: string;

  @Column({
    type: String,
    nullable: true,
  })
  photoFileName!: string | null;

  @Column({
    type: "enum",
    enum: Role,
    default: Role.MEMBER,
  })
  role!: Role;
}

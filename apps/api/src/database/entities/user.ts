import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "@bookwise/shared/enums";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({
    unique: true,
  })
  email!: string;

  @Column()
  photoFileName!: string;

  @Column({
    type: "enum",
    enum: Role,
    default: Role.MEMBER,
  })
  role!: Role;
}

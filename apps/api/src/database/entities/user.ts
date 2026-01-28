import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "@bookwise/shared";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 100 })
  firstName!: string;

  @Column("varchar", { length: 100, nullable: true })
  lastName!: string | null;

  @Column({ unique: true })
  email!: string;

  @Column("varchar", { nullable: true })
  photoFileName!: string | null;

  @Column({
    type: "enum",
    enum: Role,
    default: Role.MEMBER,
  })
  role!: Role;
}

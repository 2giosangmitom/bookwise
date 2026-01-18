import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, type Relation } from "typeorm";
import { User } from "./user";

@Entity()
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    unique: true,
  })
  refreshTokenHash!: string;

  @Column({ length: 45 })
  ipAddress!: string;

  @Column()
  userAgent!: string;

  @Column({ nullable: true })
  deviceName?: string; // "MacBook Pro"

  @Column({ nullable: true })
  os?: string; // "macOS 14"

  @Column({ nullable: true })
  browser?: string; // "Chrome 121"

  @Column({ default: false })
  revoked!: boolean;

  @Column()
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
    onDelete: "CASCADE",
  })
  user!: Relation<User>;
}

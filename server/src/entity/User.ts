import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, Min } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  NORMAL = 'normal',
}
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Min(2)
  firstName!: string;

  @Column()
  @Min(2)
  lastName!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.NORMAL,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt = new Date();

  @UpdateDateColumn()
  updatedAt = new Date();
}

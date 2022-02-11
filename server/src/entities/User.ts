import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { IsEmail, Min } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  NORMAL = 'normal',
}

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  @Min(2)
  firstName!: string;

  @Field()
  @Column()
  @Min(2)
  lastName!: string;

  @Field()
  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Field()
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.NORMAL,
  })
  role: UserRole;

  @Column()
  password!: string;

  @CreateDateColumn()
  createdAt = new Date();

  @UpdateDateColumn()
  updatedAt = new Date();
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import { User } from './User';

@Entity()
@ObjectType()
export class File extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  @IsUrl()
  url: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.files, { cascade: true })
  user: User;

  @Field()
  @Column({ nullable: true })
  publicId: string;

  @CreateDateColumn()
  createdAt = new Date();

  @UpdateDateColumn()
  updatedAt = new Date();
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Min } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import { User } from './User';
import { File } from './File';

export enum ProductEnum {
  HEADSET = 'headset',
  ROUTER = 'router',
  LAPTOP = 'laptop',
}

export enum PriorityEnum {
  NORMAL = 'normal',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum StatusEnum {
  NEW = 'new',
  OPEN = 'open',
  PENDING = 'pending',
  CLOSED = 'closed',
}

@Entity()
@ObjectType()
export class Ticket extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  @Min(2)
  subject!: string;

  @Field()
  @Column({
    type: 'enum',
    enum: ProductEnum,
  })
  product!: ProductEnum;

  @Field()
  @Column({ type: 'enum', enum: PriorityEnum, default: PriorityEnum.NORMAL })
  priority!: PriorityEnum;

  @Field()
  @Column()
  description: string;

  @Field()
  @ManyToOne(() => User)
  creator: User;

  @Field()
  @ManyToOne(() => User, { nullable: true })
  staff: User;

  @Field(() => [File])
  @Column('text', { array: true })
  @ManyToMany(() => File, {
    cascade: true,
  })
  @JoinTable()
  fileURLs: File[];

  @Field()
  @Column({ type: 'enum', enum: StatusEnum, default: StatusEnum.NEW })
  status!: StatusEnum;

  @CreateDateColumn()
  createdAt = new Date();

  @UpdateDateColumn()
  updatedAt = new Date();
}

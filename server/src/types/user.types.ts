import { User } from '../entities/User';
import { ObjectType, Field, InputType } from 'type-graphql';
import FieldError from './fieldError.types';
import { IsEmail, Min } from 'class-validator';

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => String, { nullable: true })
  token?: string;
}

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Min(2)
  password: string;

  @Field()
  @Min(2)
  firstName: string;

  @Field()
  @Min(2)
  lastName: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Min(2)
  password: string;
}

export type JWToken = {
  userId: number;
  iat: number;
  exp: number;
};

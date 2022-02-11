import { User } from '../entities/User';
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import {
  JWToken,
  LoginInput,
  RegisterInput,
  UserResponse,
} from '../types/user.types';
import argon2 from 'argon2';
import { MyContext } from 'src/types/context.types';
import jwt from 'jsonwebtoken';
import { isAuth } from '../middleware/isAuth';

@Resolver(User)
export class UserResolver {
  @Query(() => [User])
  async allUsers(): Promise<User[]> {
    try {
      const users = await User.find();
      return users;
    } catch (error) {
      throw new Error(error);
    }
  }

  @Query(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
    const authHeaders = req.headers.authorization as string;
    const token = authHeaders && authHeaders.split('Bearer ')[1];
    const decoded = jwt.verify(token, process.env.SESSION_SECRET) as JWToken;
    const id = decoded.userId;
    if (!id) {
      return undefined;
    }
    const user = await User.findOne(id);
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') { email, password, firstName, lastName }: RegisterInput
  ): Promise<UserResponse> {
    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return {
          errors: [{ field: 'email', message: 'email already in use' }],
        };
      }
      const hashedPassword = await argon2.hash(password);
      const user = User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });
      await user.save();
      const token = await jwt.sign(
        { userId: user.id },
        process.env.SESSION_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRATION,
        }
      );
      return { user, token };
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  @Mutation(() => UserResponse)
  async login(
    @Arg('option') { email, password }: LoginInput
  ): Promise<UserResponse> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return {
        errors: [{ field: 'email', message: 'Login details incorrect' }],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [{ field: 'email', message: 'Login details incorrect' }],
      };
    }
    // req.session.userId = user.id;
    const token = await jwt.sign(
      { userId: user.id },
      process.env.SESSION_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION,
      }
    );
    return { user, token };
  }
}

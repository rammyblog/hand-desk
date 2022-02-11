import { MyContext } from '../types/context.types';
import { MiddlewareFn } from 'type-graphql';
import jwt from 'jsonwebtoken';
import { JWToken } from '../types/user.types';

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  const authHeaders = context.req.headers.authorization as string;
  const token = authHeaders && authHeaders.split('Bearer ')[1];
  if (token == null) {
    throw new Error('Token not specified');
  }
  const decoded = jwt.verify(token, process.env.SESSION_SECRET) as JWToken;
  const id = decoded.userId;
  if (!id) {
    throw new Error('not authenticated');
  }
  return next();
};


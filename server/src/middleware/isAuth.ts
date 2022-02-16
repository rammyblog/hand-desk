import { MyContext } from '../types/context.types';
import { MiddlewareFn } from 'type-graphql';
import { jwtVerify } from '../utils/jwtVerify';

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (jwtVerify(context.req)) {
    return next();
  }
  throw new Error('not authenticated');
};

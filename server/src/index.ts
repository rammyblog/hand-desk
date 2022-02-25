import 'reflect-metadata';
import express from 'express';
import { createConnection } from 'typeorm';
import dotenv from 'dotenv-safe';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/user.resolver';
import session from 'express-session';
import Redis from 'ioredis';
import RedisStore from 'connect-redis';
import { COOKIE_KEY, __prod__ } from './constants';
import { MyContext } from './types/context.types';
import { FileResolver } from './resolvers/file.resolver';
import { graphqlUploadExpress } from 'graphql-upload';
import cloud from 'cloudinary';

const cloudinary = cloud.v2;

dotenv.config();
const redisClient = new Redis(process.env.REDIS_URL);
const redisStore = RedisStore(session);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

createConnection()
  .then(async (_) => {
    const app = express();
    app.use(express.json());
    if (__prod__) {
      app.set('trust proxy', 1); // trust first proxy
    }
    app.get('/', (_, res) => {
      res.send('Hello World!');
    });

    app.use(
      session({
        store: new redisStore({ client: redisClient, disableTouch: true }),
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
          httpOnly: true,
          secure: __prod__, // cookie only works in https
          sameSite: 'lax', // csrf
          domain: __prod__ ? '.lireddit.tech' : undefined,
        },
        resave: false,
        name: COOKIE_KEY,
      })
    );
    app.use(graphqlUploadExpress());

    const server = new ApolloServer({
      schema: await buildSchema({
        resolvers: [UserResolver, FileResolver],
        validate: false,
      }),
      context: ({ req, res }): MyContext => ({
        req,
        res,
      }),
      plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    });
    await server.start();
    server.applyMiddleware({
      app,
      cors: false,
    });

    app.listen(process.env.PORT, () =>
      console.log(`Listening on port ${process.env.PORT}`)
    );
  })
  .catch((error) => console.log(error));

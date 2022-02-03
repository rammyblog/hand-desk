import 'reflect-metadata';
import express from 'express';
import { createConnection } from 'typeorm';
import dotenv from 'dotenv-safe';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'graphql';

dotenv.config();

createConnection()
  .then(async (_) => {
    const app = express();
    app.use(express.json());

    app.get('/', (_, res) => {
      res.send('Hello World!');
    });

    const server = new ApolloServer({
      schema: await buildSchema({
        resolvers: [],
        validate: false,
      }),
      context: ({ req, res }) => ({
        req,
        res,
      }),
      plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    });
    await server.start();
    server.applyMiddleware({ app });

    app.listen(process.env.PORT, () =>
      console.log(`Listening on port ${process.env.PORT}`)
    );
  })
  .catch((error) => console.log(error));

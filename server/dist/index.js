"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const typeorm_1 = require("typeorm");
const dotenv_safe_1 = __importDefault(require("dotenv-safe"));
const apollo_server_core_1 = require("apollo-server-core");
const apollo_server_express_1 = require("apollo-server-express");
const graphql_1 = require("graphql");
dotenv_safe_1.default.config();
(0, typeorm_1.createConnection)()
    .then(async (_) => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.get('/', (_, res) => {
        res.send('Hello World!');
    });
    const server = new apollo_server_express_1.ApolloServer({
        schema: await (0, graphql_1.buildSchema)({
            resolvers: [],
            validate: false,
        }),
        context: ({ req, res }) => ({
            req,
            res,
        }),
        plugins: [(0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)()],
    });
    await server.start();
    server.applyMiddleware({ app });
    app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`));
})
    .catch((error) => console.log(error));
//# sourceMappingURL=index.js.map
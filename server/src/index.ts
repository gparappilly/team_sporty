import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDatabase from "./config/database";
import { UserResolver } from "./resolver/UserResolver";
import routes from "./routes/index";
import { TeamResolver } from "./resolver/TeamResolver";
import { TypegooseMiddleware } from "./middleware/typegooseMiddleware";
import { PostResolver } from "./resolver/PostResolver";
import { EventResolver } from "./resolver/EventResolver";
import { json } from "express";
import { TestResolver } from "./resolver/TestResolver";
import { CommentResolver } from "./resolver/CommentResolver";
import { LikesMapResolver } from "./resolver/LikesMapResolver";
(async () => {
    const app = express();
    connectDatabase();
    app.use(
        cors({
            origin: process.env.PORT
                ? [
                      /^https:\/\/teamsporty.*\.vercel\.app$/,
                      /^https:\/\/teamsporty-\w{9}\.vercel\.app$/,
                      /^https:\/\/teamsp0rty.*\.vercel\.app$/,
                  ]
                : "http://localhost:3000",
            credentials: true,
        }),
    );
    //TODO: remove testResolver
    app.use(cookieParser());
    app.use(json({ limit: "50mb" }));
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                UserResolver,
                TeamResolver,
                PostResolver,
                EventResolver,
                TestResolver,
                CommentResolver,
                LikesMapResolver,
            ],
            globalMiddlewares: [TypegooseMiddleware],
        }),
        context: ({ req, res }) => ({ req, res }),
    });

    apolloServer.applyMiddleware({ app, cors: false });
    app.use(routes);
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
        console.log(`express server started on http://localhost:${port}/graphql`);
    });
})();

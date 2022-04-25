import { ApolloServer } from "apollo-server-express"
import express from "express"
import "reflect-metadata"
import { buildSchema } from "type-graphql"
import { createConnection } from "typeorm"

(async () => {
  const app = express()
  await createConnection()

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [`${__dirname}/resolver/*.ts`],
    }),
    context: ({ req, res }) => ({ req, res })
  })

  await apolloServer.start()
  apolloServer.applyMiddleware({ app })

  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`)
  })
})()

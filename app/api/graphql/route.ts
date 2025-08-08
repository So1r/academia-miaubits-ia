import { createYoga, createSchema } from "graphql-yoga";
import { NextRequest } from "next/server";
import type { NextRequest as NextRequestType } from "next/server";
import { typeDefs } from "@/lib/gql/schema";
import { resolvers } from "@/lib/gql/resolvers";

const { handleRequest } = createYoga<{
  req: NextRequestType;
}>({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Request, Response }
});

export { handleRequest as GET, handleRequest as POST };

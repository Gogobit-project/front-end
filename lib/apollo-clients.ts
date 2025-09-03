import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_DOMA_SUBGRAPH,
    headers: {
      "Api-Key": process.env.NEXT_PUBLIC_DOMA_API_KEY ?? "",
    },
  }),
  cache: new InMemoryCache(),
});

import { gql } from "@apollo/client";
import { client } from "./apollo-clients";

const GET_MY_NAMES = gql`
  query GetMyNames {
    myNames: names(take: 10, ownedBy: ["eip155:8453:0xe8431e91C3911870E7b218A5336b211E53A03b4C"], sortOrder: DESC) {
      items {
        name
        registrar {
          name
        }
        tokens {
          tokenId
          explorerUrl
          expiresAt
        }
      }
    }
  }
`;

export async function getNames() {
  const { data } = await client.query<any>({ query: GET_MY_NAMES });
  return data.myNames.items;
}

import { gql } from "@apollo/client";
import { client } from "./apollo-clients";

export async function getUserDomains(ownerAddress: string) {
  const { data } = (await client.query({
    query: gql`
      query GetUserDomains($owner: [AddressCAIP10!]) {
        names(take: 50, ownedBy: $owner, sortOrder: DESC) {
          items {
            name
            registrar {
              name
            }
            tokens {
              tokenId
              explorerUrl
            }
          }
        }
      }
    `,
    variables: {
      owner: [`eip155:8453:${ownerAddress.toLowerCase()}`], // ✅ format CAIP-10
    },
    fetchPolicy: "no-cache",
  })) as { data: { names: { items: any[] } } };

  return data.names.items;
}

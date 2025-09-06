import { gql } from "@apollo/client";
import { client } from "./apollo-clients";

export async function getDomainUserSubgraph(ownerAddress: string) {
  const { data } = (await client.query({
    query: gql`
      query Items($ownedBy: [AddressCAIP10!]) {
        names(ownedBy: $ownedBy) {
          items {
            name
            tokens {
              tokenId
            }
          }
        }
      }
    `,
    variables: {
      ownedBy: [`eip155:8453:${ownerAddress}`], // ✅ format CAIP-10
    },
    fetchPolicy: "no-cache",
  })) as { data: { names: { items: any[] } } };

  return data.names.items;
}

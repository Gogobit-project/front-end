import { gql } from "@apollo/client";
import { client } from "./apollo-clients";

const GET_NAMES = gql`
  query getNames {
    myNames: names(take: 50, ownedBy: ["eip155:8453:0xe8431e91C3911870E7b218A5336b211E53A03b4C"], sortOrder: DESC) {
      items {
        name
        expiresAt
        registrar {
          name
        }
        tokens {
          tokenId
          tokenAddress
          networkId
          startsAt
          ownerAddress
          expiresAt
          explorerUrl
          createdAt
          chain {
            name
            networkId
          }
          listings {
            id
            externalId
            price
            orderbook
            offererAddress
            createdAt
            updatedAt
            expiresAt
            currency {
              symbol
              name
              decimals
            }
          }
        }
      }
    }
  }
`;

export async function getAuctionDetail(tokenId: string) {
  const { data } = await client.query<any>({ query: GET_NAMES });
  // cari token yang cocok
  for (const nameItem of data.myNames.items) {
    const found = nameItem.tokens.find((t: any) => t.tokenId === tokenId);
    if (found) {
      return {
        ...nameItem,
        token: found,
      };
    }
  }
  return null;
}

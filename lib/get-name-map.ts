import { gql } from "@apollo/client";
import { client } from "./apollo-clients";

const QUERY_NAME_BY_TOKENID = gql`
query NameFromToken($tokenId: String!) {
  nameStatistics(tokenId: $tokenId) {
    name
  }
}

`;


// ----- Types untuk hasil query -----
type NameStatistics = {
  tokenId: string;
  name: string | null;
};

type NameFromTokenQuery = {
  nameStatistics: NameStatistics | null;
};

// Kembalikan array items (bisa kosong)
async function getNameByTokenId(tokenId: string): Promise<string | null> {
  const { data } = await client.query<NameFromTokenQuery>({
    query: QUERY_NAME_BY_TOKENID,
    variables: { tokenId },   // <---- ini cara passing param
  });

  return data?.nameStatistics?.name ?? null;
}

// export async function getNameMap(tokenId:string): Promise<Map<string, string>> {
//   const items = await getNamesAll(tokenId);
//   const map = new Map<string, string>();

//   for (const n of items) {
//     for (const t of n ?? []) {
//       map.set(String(t), n);
//     }
//   }
//   return map;
// }

// Batch version
export async function getNameMap(tokenIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  await Promise.all(
    tokenIds.map(async (id) => {
      const name = await getNameByTokenId(id); // function yg ambil string/null
      if (name) map.set(id, name);
    })
  );
  console.log("domain submitted:", map)
  return map;
}


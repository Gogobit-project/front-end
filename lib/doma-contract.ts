import { ethers } from "ethers";
import DomaABI from "../app/abis/Doma.json";

const DOMA_CONTRACT = "0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f";

export function getDomaContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(DOMA_CONTRACT, DomaABI, signerOrProvider) as unknown as ethers.Contract & {
    approve(to: string, tokenId: bigint): Promise<any>;
    ownerOf(tokenId: bigint): Promise<string>;
  };
}

export type BidStatusUI = "winning" | "outbid" | "won" | "lost";

export interface UserBid {
  id: string;
  domain: string;
  currentBid: number;
  myBid: number;
  status: BidStatusUI;
  timeLeft: string;
  auctionId: string;
}

export interface UserSubmission {
  id: string;
  domain: string;
  status: "pending" | "approved" | "rejected" | "live";
  submittedDate: string;
  startingBid: number;
  currentBid?: number;
}

export interface UserCollection {
  id: string;
  domain: string;
  purchasePrice: number;
  purchaseDate: string;
  estimatedValue: number;
  status: "owned" | "listed";
}

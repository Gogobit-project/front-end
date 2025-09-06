export type BidStatusUI = "winning" | "outbid" | "won" | "lost";
export type SubmissionStatusUI = "pending" | "rejected" | "live";
export type CollectionStatusUI = "owned" | "listed";

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
  status: SubmissionStatusUI;
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
  status: CollectionStatusUI;
}

import { UserCollection, UserSubmission } from "./types";

export const USER_STATS = {
  totalBids: 23,
  wonAuctions: 5,
  totalSpent: 45.7,
  portfolioValue: 78.3,
};

export const MOCK_USER_SUBMISSIONS: UserSubmission[] = [
  { id: "1", domain: "myproject.eth", status: "live", submittedDate: "2024-01-15", startingBid: 2.0, currentBid: 3.5 },
  { id: "2", domain: "innovation.eth", status: "pending", submittedDate: "2024-01-20", startingBid: 5.0 },
  { id: "3", domain: "future.eth", status: "live", submittedDate: "2024-01-18", startingBid: 3.0 },
];

export const MOCK_USER_COLLECTION: UserCollection[] = [
  { id: "1", domain: "web3.eth", purchasePrice: 14.5, purchaseDate: "2024-01-19", estimatedValue: 18.2, status: "owned" },
  { id: "2", domain: "blockchain.eth", purchasePrice: 8.7, purchaseDate: "2024-01-10", estimatedValue: 12.1, status: "owned" },
  { id: "3", domain: "nft.eth", purchasePrice: 22.5, purchaseDate: "2024-01-05", estimatedValue: 28.0, status: "listed" },
];

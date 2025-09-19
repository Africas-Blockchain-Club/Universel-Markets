export const PREDICTION_MARKET_ABI = [
  {
    inputs: [],
    name: "getMarkets",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "question", type: "string" },
          { name: "category", type: "string" },
          { name: "creator", type: "address" },
          { name: "endTime", type: "uint256" },
          { name: "totalVolume", type: "uint256" },
          { name: "yesShares", type: "uint256" },
          { name: "noShares", type: "uint256" },
          { name: "resolved", type: "bool" },
          { name: "outcome", type: "bool" },
          { name: "participantCount", type: "uint256" },
        ],
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "_question", type: "string" },
      { name: "_category", type: "string" },
      { name: "_endTime", type: "uint256" },
      { name: "_initialLiquidity", type: "uint256" },
    ],
    name: "createMarket",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "_marketId", type: "uint256" },
      { name: "_isYes", type: "bool" },
    ],
    name: "placeBet",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "_marketId", type: "uint256" }],
    name: "getMarketDetails",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "question", type: "string" },
          { name: "category", type: "string" },
          { name: "creator", type: "address" },
          { name: "endTime", type: "uint256" },
          { name: "totalVolume", type: "uint256" },
          { name: "yesShares", type: "uint256" },
          { name: "noShares", type: "uint256" },
          { name: "resolved", type: "bool" },
          { name: "outcome", type: "bool" },
          { name: "participantCount", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const

export const PREDICTION_MARKET_ADDRESS = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7" // Example address

export interface RawMarket {
  id: bigint
  question: string
  category: string
  creator: string
  endTime: bigint
  totalVolume: bigint
  yesShares: bigint
  noShares: bigint
  resolved: boolean
  outcome: boolean
  participantCount: bigint
}

export interface Market {
  id: number
  title: string
  category: string
  creator: string
  endTime: number
  totalVolume: string // Changed to string to avoid BigInt rendering issues
  yesShares: string // Changed to string
  noShares: string // Changed to string
  resolved: boolean
  outcome: boolean
  participantCount: number
  volume: string
  yesPrice: number
  noPrice: number
  endDate: string
  participants: number
  trending: boolean
}

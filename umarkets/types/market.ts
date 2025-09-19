export interface Category {
  name: string
  count: number
}

export interface NewMarket {
  title: string
  description: string
  category: string
  endDate: Date | undefined // Changed from Date | null to Date | undefined
  initialLiquidity: string
  tags: string
}

export interface BetSide {
  side: "yes" | "no"
  amount: string
}

declare global {
  interface Window {
    ethereum?: any
  }
}

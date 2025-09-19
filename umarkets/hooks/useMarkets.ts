"use client"

import { useState, useEffect } from "react"
import { ethers, type Contract } from "ethers"
import type { RawMarket, Market } from "../contracts/PredicationMarkets"

interface MarketsState {
  markets: Market[]
  isLoading: boolean
  error: string | null
}

interface MarketsActions {
  fetchMarkets: () => Promise<void>
  createMarket: (question: string, category: string, endTime: number, initialLiquidity: string) => Promise<string>
  placeBet: (marketId: number, isYes: boolean, amount: string) => Promise<string>
}

export type UseMarketsReturn = MarketsState & MarketsActions

export function useMarkets(contract: Contract | null): UseMarketsReturn {
  const [markets, setMarkets] = useState<Market[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMarkets = async (): Promise<void> => {
    if (!contract) return

    try {
      setIsLoading(true)
      setError(null)

      const rawMarkets: RawMarket[] = await contract.getMarkets()

      const formattedMarkets: Market[] = rawMarkets.map((market) => {
        const totalShares = market.yesShares + market.noShares
        const yesPrice = totalShares > 0n ? Number(market.yesShares) / Number(totalShares) : 0.5
        const noPrice = 1 - yesPrice

        return {
          id: Number(market.id),
          title: market.question,
          category: market.category,
          creator: market.creator,
          endTime: Number(market.endTime),
          totalVolume: market.totalVolume,
          yesShares: market.yesShares,
          noShares: market.noShares,
          resolved: market.resolved,
          outcome: market.outcome,
          participantCount: Number(market.participantCount),
          // Computed fields
          volume: `$${(Number(ethers.formatEther(market.totalVolume)) * 2000).toLocaleString()}`, // Assuming ETH price ~$2000
          yesPrice,
          noPrice,
          endDate: new Date(Number(market.endTime) * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          participants: Number(market.participantCount),
          trending: Number(market.totalVolume) > Number(ethers.parseEther("1")), // Markets with >1 ETH volume are trending
        }
      })

      setMarkets(formattedMarkets)
    } catch (err) {
      console.error("Failed to fetch markets:", err)
      setError("Failed to load markets from contract")
    } finally {
      setIsLoading(false)
    }
  }

  const createMarket = async (
    question: string,
    category: string,
    endTime: number,
    initialLiquidity: string,
  ): Promise<string> => {
    if (!contract) throw new Error("Contract not connected")

    try {
      const liquidityWei = ethers.parseEther(initialLiquidity)
      const tx = await contract.createMarket(question, category, endTime, liquidityWei, {
        value: liquidityWei,
      })

      await tx.wait()

      // Refresh markets after creation
      await fetchMarkets()

      return tx.hash
    } catch (err) {
      console.error("Failed to create market:", err)
      throw err
    }
  }

  const placeBet = async (marketId: number, isYes: boolean, amount: string): Promise<string> => {
    if (!contract) throw new Error("Contract not connected")

    try {
      const amountWei = ethers.parseEther(amount)
      const tx = await contract.placeBet(marketId, isYes, {
        value: amountWei,
      })

      await tx.wait()

      // Refresh markets after bet
      await fetchMarkets()

      return tx.hash
    } catch (err) {
      console.error("Failed to place bet:", err)
      throw err
    }
  }

  useEffect(() => {
    fetchMarkets()
  }, [contract])

  return {
    markets,
    isLoading,
    error,
    fetchMarkets,
    createMarket,
    placeBet,
  }
}

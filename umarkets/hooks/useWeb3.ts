"use client"

import { useState } from "react"
import { ethers, type BrowserProvider, type Contract, type Signer } from "ethers"
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from "../contracts/PredicationMarkets"

interface Web3State {
  provider: BrowserProvider | null
  signer: Signer | null
  contract: Contract | null
  account: string
  isConnected: boolean
  isLoading: boolean
}

interface Web3Actions {
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

export type UseWeb3Return = Web3State & Web3Actions

export function useWeb3(): UseWeb3Return {
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [signer, setSigner] = useState<Signer | null>(null)
  const [contract, setContract] = useState<Contract | null>(null)
  const [account, setAccount] = useState<string>("")
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const connectWallet = async (): Promise<void> => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setIsLoading(true)
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send("eth_requestAccounts", [])
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI, signer)

        setProvider(provider)
        setSigner(signer)
        setContract(contract)
        setAccount(accounts[0])
        setIsConnected(true)
      } catch (error) {
        console.error("Failed to connect wallet:", error)
      } finally {
        setIsLoading(false)
      }
    } else {
      alert("Please install MetaMask!")
    }
  }

  const disconnectWallet = (): void => {
    setProvider(null)
    setSigner(null)
    setContract(null)
    setAccount("")
    setIsConnected(false)
  }

  return {
    provider,
    signer,
    contract,
    account,
    isConnected,
    isLoading,
    connectWallet,
    disconnectWallet,
  }
}

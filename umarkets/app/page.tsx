"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badges"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/iinput"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  TrendingUp,
  Wallet,
  User,
  LogOut,
  Search,
  Filter,
  ChevronDown,
  DollarSign,
  Clock,
  Users,
  Shield,
  Zap,
  Plus,
  CalendarIcon,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alerts"
import { format } from "date-fns"
import { useWeb3 } from "../hooks/useWeb3"
import { useMarkets } from "../hooks/useMarkets"
import type { Market } from "../contracts/PredicationMarkets"
import type { Category, NewMarket } from "../types/market"
import Image from "next/image"
import { ethers } from "ethers"

const categories: Category[] = [
  { name: "All", count: 0 },
  { name: "Politics", count: 0 },
  { name: "Crypto", count: 0 },
  { name: "Sports", count: 0 },
  { name: "Economics", count: 0 },
  { name: "Technology", count: 0 },
]

export default function UniverselMarkets() {
  const { contract, account, isConnected, isLoading: web3Loading, connectWallet, disconnectWallet } = useWeb3()
  const { markets, isLoading: marketsLoading, error, fetchMarkets, createMarket, placeBet } = useMarkets(contract)

  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [betAmount, setBetAmount] = useState<string>("")
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [userBalance, setUserBalance] = useState<string>("0")

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  const [isCreatingMarket, setIsCreatingMarket] = useState<boolean>(false)
  const [isBetting, setIsBetting] = useState<boolean>(false)
  const [newMarket, setNewMarket] = useState<NewMarket>({
    title: "",
    description: "",
    category: "",
    endDate: undefined, // Changed from null to undefined
    initialLiquidity: "",
    tags: "",
  })

  // Update category counts based on actual markets
  useEffect(() => {
    const updatedCategories = categories.map((cat) => ({
      ...cat,
      count: cat.name === "All" ? markets.length : markets.filter((m) => m.category === cat.name).length,
    }))
    // You could set this to state if needed
  }, [markets])

  // Fetch user balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (isConnected && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const balance = await provider.getBalance(account)
          setUserBalance(ethers.formatEther(balance))
        } catch (err) {
          console.error("Failed to fetch balance:", err)
        }
      }
    }
    fetchBalance()
  }, [isConnected, account])

  const handleCreateMarket = async (): Promise<void> => {
    if (!newMarket.title || !newMarket.category || !newMarket.endDate || !newMarket.initialLiquidity) {
      return
    }

    try {
      setIsCreatingMarket(true)
      const endTimeUnix = Math.floor(newMarket.endDate.getTime() / 1000)

      await createMarket(
        newMarket.title,
        newMarket.category,
        endTimeUnix,
        (Number.parseFloat(newMarket.initialLiquidity) / 2000).toString(), // Convert USD to ETH (rough estimate)
      )

      setIsCreateModalOpen(false)
      setNewMarket({
        title: "",
        description: "",
        category: "",
        endDate: undefined, // Changed from null to undefined
        initialLiquidity: "",
        tags: "",
      })
    } catch (err) {
      console.error("Failed to create market:", err)
      alert("Failed to create market. Please try again.")
    } finally {
      setIsCreatingMarket(false)
    }
  }

  const handlePlaceBet = async (marketId: number, side: "yes" | "no", amount: string): Promise<void> => {
    try {
      setIsBetting(true)
      const ethAmount = (Number.parseFloat(amount) / 2000).toString() // Convert USD to ETH

      await placeBet(marketId, side === "yes", ethAmount)

      setSelectedMarket(null)
      setBetAmount("")
    } catch (err) {
      console.error("Failed to place bet:", err)
      alert("Failed to place bet. Please try again.")
    } finally {
      setIsBetting(false)
    }
  }

  // Helper function to handle date selection with proper type conversion
  const handleDateSelect = (date: Date | undefined) => {
    setNewMarket({ ...newMarket, endDate: date })
  }

  const filteredMarkets: Market[] =
    selectedCategory === "All" ? markets : markets.filter((market) => market.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/universel-bg.jpg')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-slate-900/20" />

      {/* Header */}
      <header className="relative bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Image
                  src="/universel-logo.png"
                  alt="Universel Protocol"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Universel Markets
                </span>
              </div>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                <Shield className="w-3 h-3 mr-1" />
                Web3 Contract
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search markets..."
                  className="pl-10 w-64 bg-slate-800/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-blue-500"
                />
              </div>

              <Button
                variant="outline"
                onClick={fetchMarkets}
                disabled={marketsLoading}
                className="bg-slate-800/50 border-slate-600 text-slate-100 hover:bg-slate-700/50"
              >
                <RefreshCw className={`w-4 h-4 ${marketsLoading ? "animate-spin" : ""}`} />
              </Button>

              {isConnected && (
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Market
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-slate-100">
                    <DialogHeader>
                      <DialogTitle className="text-slate-100">Create New Prediction Market</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Create a new market on the blockchain. This will require a transaction.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="market-title" className="text-slate-200">
                          Market Question *
                        </Label>
                        <Input
                          id="market-title"
                          placeholder="e.g., Will Bitcoin reach $100,000 by end of 2024?"
                          value={newMarket.title}
                          onChange={(e) => setNewMarket({ ...newMarket, title: e.target.value })}
                          className="bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-200">Category *</Label>
                          <Select
                            value={newMarket.category}
                            onValueChange={(value) => setNewMarket({ ...newMarket, category: value })}
                          >
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="Politics">Politics</SelectItem>
                              <SelectItem value="Crypto">Crypto</SelectItem>
                              <SelectItem value="Sports">Sports</SelectItem>
                              <SelectItem value="Economics">Economics</SelectItem>
                              <SelectItem value="Technology">Technology</SelectItem>
                              <SelectItem value="Space">Space</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-200">Resolution Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newMarket.endDate ? format(newMarket.endDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600" align="start">
                              <Calendar
                                mode="single"
                                selected={newMarket.endDate}
                                onSelect={handleDateSelect}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="text-slate-100"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="initial-liquidity" className="text-slate-200">
                          Initial Liquidity (USD)
                        </Label>
                        <Input
                          id="initial-liquidity"
                          type="number"
                          placeholder="1000"
                          value={newMarket.initialLiquidity}
                          onChange={(e) => setNewMarket({ ...newMarket, initialLiquidity: e.target.value })}
                          className="bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-400"
                        />
                        <p className="text-xs text-slate-400">This will be converted to ETH and sent to the contract</p>
                      </div>

                      <Alert className="bg-blue-900/20 border-blue-500/30">
                        <AlertCircle className="h-4 w-4 text-blue-400" />
                        <AlertDescription className="text-blue-300">
                          Creating a market requires a blockchain transaction and will cost gas fees.
                        </AlertDescription>
                      </Alert>
                    </div>

                    <DialogFooter className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateModalOpen(false)}
                        className="bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700/50"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateMarket}
                        disabled={!newMarket.title || !newMarket.category || !newMarket.endDate || isCreatingMarket}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        {isCreatingMarket && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Create Market
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {isConnected ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2 bg-slate-800/50 border-slate-600 text-slate-100 hover:bg-slate-700/50"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                          {account.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{Number.parseFloat(userBalance).toFixed(4)} ETH</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                    <DropdownMenuLabel className="text-slate-100">
                      <div className="text-xs text-slate-400">Connected Account</div>
                      <div className="font-mono text-sm">
                        {account.slice(0, 6)}...{account.slice(-4)}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem className="text-slate-100 hover:bg-slate-700">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-100 hover:bg-slate-700">
                      <Wallet className="mr-2 h-4 w-4" />
                      Portfolio
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem onClick={disconnectWallet} className="text-slate-100 hover:bg-slate-700">
                      <LogOut className="mr-2 h-4 w-4" />
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={connectWallet}
                  disabled={web3Loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  {web3Loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-lg text-slate-100">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => {
                  const count =
                    category.name === "All"
                      ? markets.length
                      : markets.filter((m) => m.category === category.name).length
                  return (
                    <Button
                      key={category.name}
                      variant={selectedCategory === category.name ? "default" : "ghost"}
                      className={`w-full justify-between ${
                        selectedCategory === category.name
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          : "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
                      }`}
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      <span>{category.name}</span>
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                        {count}
                      </Badge>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>

            {isConnected && (
              <Card className="mt-6 bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-100">Your Wallet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Balance</span>
                      <span className="font-semibold text-slate-100">
                        {Number.parseFloat(userBalance).toFixed(4)} ETH
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Address</span>
                      <span className="font-mono text-xs text-slate-300">
                        {account.slice(0, 6)}...{account.slice(-4)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-100">
                Prediction Markets
                {marketsLoading && <Loader2 className="inline w-5 h-5 ml-2 animate-spin text-blue-400" />}
              </h1>
              <Button
                variant="outline"
                className="bg-slate-800/50 border-slate-600 text-slate-100 hover:bg-slate-700/50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {marketsLoading && markets.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
                  <p className="text-slate-400">Loading markets from blockchain...</p>
                </div>
              </div>
            ) : filteredMarkets.length === 0 ? (
              <Card className="p-12 text-center bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                <p className="text-slate-400 mb-4">No markets found in this category</p>
                {isConnected && (
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Market
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredMarkets.map((market) => (
                  <Card
                    key={market.id}
                    className="hover:shadow-xl transition-all duration-300 bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="border-slate-600 text-slate-300">
                              {market.category}
                            </Badge>
                            {market.trending && (
                              <Badge
                                variant="secondary"
                                className="bg-orange-500/20 text-orange-300 border-orange-500/30"
                              >
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                              #{market.id}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-slate-100 mb-2">{market.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {market.volume} volume
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {market.participants} traders
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Ends {market.endDate}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-20 flex flex-col items-center justify-center space-y-1 border-green-500/30 hover:bg-green-500/10 bg-green-500/5 text-green-400 hover:text-green-300"
                              onClick={() => setSelectedMarket(market)}
                              disabled={!isConnected}
                            >
                              <span className="text-2xl font-bold">{(market.yesPrice * 100).toFixed(0)}¢</span>
                              <span className="text-sm font-medium">YES</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
                            <DialogHeader>
                              <DialogTitle className="text-slate-100">Place YES Bet</DialogTitle>
                              <DialogDescription className="text-slate-400">{market.title}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="amount" className="text-slate-200">
                                  Bet Amount (USD)
                                </Label>
                                <Input
                                  id="amount"
                                  type="number"
                                  placeholder="0.00"
                                  value={betAmount}
                                  onChange={(e) => setBetAmount(e.target.value)}
                                  className="bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-400"
                                />
                              </div>
                              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <div className="flex justify-between text-sm text-slate-300">
                                  <span>Price per share:</span>
                                  <span>{(market.yesPrice * 100).toFixed(0)}¢</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-300">
                                  <span>ETH Amount:</span>
                                  <span>
                                    {betAmount ? (Number.parseFloat(betAmount) / 2000).toFixed(6) : "0.000000"} ETH
                                  </span>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => handlePlaceBet(market.id, "yes", betAmount)}
                                disabled={!betAmount || isBetting}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                              >
                                {isBetting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Place YES Bet
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-20 flex flex-col items-center justify-center space-y-1 border-red-500/30 hover:bg-red-500/10 bg-red-500/5 text-red-400 hover:text-red-300"
                              onClick={() => setSelectedMarket(market)}
                              disabled={!isConnected}
                            >
                              <span className="text-2xl font-bold">{(market.noPrice * 100).toFixed(0)}¢</span>
                              <span className="text-sm font-medium">NO</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
                            <DialogHeader>
                              <DialogTitle className="text-slate-100">Place NO Bet</DialogTitle>
                              <DialogDescription className="text-slate-400">{market.title}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="amount" className="text-slate-200">
                                  Bet Amount (USD)
                                </Label>
                                <Input
                                  id="amount"
                                  type="number"
                                  placeholder="0.00"
                                  value={betAmount}
                                  onChange={(e) => setBetAmount(e.target.value)}
                                  className="bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-400"
                                />
                              </div>
                              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <div className="flex justify-between text-sm text-slate-300">
                                  <span>Price per share:</span>
                                  <span>{(market.noPrice * 100).toFixed(0)}¢</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-300">
                                  <span>ETH Amount:</span>
                                  <span>
                                    {betAmount ? (Number.parseFloat(betAmount) / 2000).toFixed(6) : "0.000000"} ETH
                                  </span>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => handlePlaceBet(market.id, "no", betAmount)}
                                disabled={!betAmount || isBetting}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                              >
                                {isBetting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Place NO Bet
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>YES {(market.yesPrice * 100).toFixed(0)}%</span>
                          <span>NO {(market.noPrice * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={market.yesPrice * 100} className="h-2 bg-slate-700" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isConnected && (
              <Card className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-xl border-blue-500/30">
                <CardContent className="p-6 text-center">
                  <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-blue-100 mb-2">Connect Your Web3 Wallet</h3>
                  <p className="text-blue-300 mb-4">
                    Connect your wallet to interact with prediction markets on the blockchain
                  </p>
                  <Button
                    onClick={connectWallet}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

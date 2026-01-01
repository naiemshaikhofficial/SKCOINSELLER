"use client"

import { useEffect, useState, use } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase-client"
import { Gavel, Timer, Coins, ShieldCheck, History, Wallet, ArrowLeft } from "lucide-react"
import { CountdownTimer } from "@/components/countdown-timer"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

export default function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)
    const [auction, setAuction] = useState<any>(null)
    const [bids, setBids] = useState<any[]>([])
    const [balance, setBalance] = useState<number>(0)
    const [user, setUser] = useState<any>(null)
    const [bidAmount, setBidAmount] = useState("")
    const [loading, setLoading] = useState(true)
    const [isBidding, setIsBidding] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchAuctionData()

        // real-time subscription for new bids
        const channel = supabase
            .channel(`auction-${id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'bids',
                filter: `auction_id=eq.${id}`
            }, () => {
                fetchBids()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [id])

    async function fetchAuctionData() {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            setUser(authUser)

            if (authUser) {
                const { data: wallet } = await supabase
                    .from("user_wallets")
                    .select("balance")
                    .eq("user_id", authUser.id)
                    .single()
                setBalance(Number(wallet?.balance || 0))
            }

            const { data: auctionData, error } = await supabase
                .from("auctions")
                .select("*, coins(*)")
                .eq("id", id)
                .single()

            if (error) throw error
            setAuction(auctionData)
            fetchBids()
        } catch (error) {
            console.error("Error fetching auction:", error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchBids() {
        const { data } = await supabase
            .from("bids")
            .select("*, user_profiles(full_name)")
            .eq("auction_id", id)
            .order("amount", { ascending: false })

        if (data) setBids(data)
    }

    const currentMaxBid = bids.length > 0 ? Number(bids[0].amount) : Number(auction?.min_price || 0)

    async function handlePlaceBid() {
        if (!user) {
            window.location.href = "/auth/login"
            return
        }

        const amount = Number(bidAmount)
        if (isNaN(amount) || amount <= currentMaxBid) {
            alert(`Bid must be higher than ₹${currentMaxBid}`)
            return
        }

        if (amount > balance) {
            alert("Insufficient wallet balance. Please add money to your wallet.")
            return
        }

        setIsBidding(true)
        try {
            // 1. DEDUCT FROM WALLET
            const { error: walletError } = await supabase
                .from("user_wallets")
                .update({ balance: balance - amount })
                .eq("user_id", user.id)

            if (walletError) throw walletError

            // 2. LOG DEDUCTION
            await supabase.from("wallet_transactions").insert({
                user_id: user.id,
                amount: amount,
                type: "bid_deduction",
                description: `Bid placed on ${auction.coins.name}`
            })

            // 3. REFUND PREVIOUS BIDDER
            if (bids.length > 0) {
                const prevBidder = bids[0].user_id
                const prevAmount = Number(bids[0].amount)

                if (prevBidder !== user.id) {
                    // Add back to their wallet
                    // Note: In real production, this SHOULD be an RPC/Trigger for safety
                    const { data: prevWallet } = await supabase.from("user_wallets").select("balance").eq("user_id", prevBidder).single()
                    if (prevWallet) {
                        await supabase.from("user_wallets").update({ balance: Number(prevWallet.balance) + prevAmount }).eq("user_id", prevBidder)

                        await supabase.from("wallet_transactions").insert({
                            user_id: prevBidder,
                            amount: prevAmount,
                            type: "refund",
                            description: `Refund for outbid on ${auction.coins.name}`
                        })
                    }
                }
            }

            // 4. RECORD NEW BID
            const { error: bidError } = await supabase
                .from("bids")
                .insert({
                    auction_id: id,
                    user_id: user.id,
                    amount: amount
                })

            if (bidError) throw bidError

            setBidAmount("")
            alert("Bid placed successfully!")
            fetchAuctionData()
        } catch (error) {
            console.error("Bidding error:", error)
            alert("Failed to place bid. Please try again.")
        } finally {
            setIsBidding(false)
        }
    }

    const isEnded = new Date(auction.end_time) < new Date()
    const isWinner = isEnded && bids.length > 0 && bids[0].user_id === user?.id

    async function handleCheckout() {
        // Implement checkout logic here or redirect to a special checkout page
        // For now, we'll redirect to checkout with a query param to handle the auction price
        router.push(`/checkout?auction_id=${id}&price=${currentMaxBid}`)
    }

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading Auction...</div>
    if (!auction) return <div className="min-h-screen bg-background flex items-center justify-center">Auction not found.</div>


    return (
        <main className="min-h-screen flex flex-col bg-background">
            <Header />

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
                <div className="grid lg:grid-cols-2 gap-12">

                    {/* Left: Product Images & Info */}
                    <div className="space-y-8">
                        <Card className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 relative flex items-center justify-center rounded-3xl overflow-hidden border-2 border-accent/20">
                            <div className="animate-coin">
                                <Coins className="w-40 h-40 text-accent/20" />
                            </div>
                            {auction.coins?.image_url && (
                                <img src={auction.coins.image_url} alt={auction.coins.name} className="absolute inset-0 w-full h-full object-contain p-12" />
                            )}
                        </Card>

                        <div className="space-y-4">
                            <h1 className="text-3xl font-black text-primary">{auction.coins?.name}</h1>
                            <p className="text-muted-foreground leading-relaxed">{auction.coins?.description}</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-secondary/20 rounded-xl">
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Metal</p>
                                    <p className="font-bold text-primary">{auction.coins?.metal || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-secondary/20 rounded-xl">
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Year</p>
                                    <p className="font-bold text-primary">{auction.coins?.year || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Bidding Interface */}
                    <div className="space-y-6">
                        <Card className="p-8 border-2 border-accent/50 bg-gradient-to-b from-card to-accent/5 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Gavel className="w-24 h-24" />
                            </div>

                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-sm text-muted-foreground uppercase font-black tracking-widest">Active Auction</p>
                                    <h2 className="text-4xl font-black text-primary mt-1">₹{currentMaxBid.toLocaleString()}</h2>
                                    <p className="text-xs text-accent font-bold mt-1 tracking-tighter">● CURRENT HIGHEST BID</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Time Remaining</p>
                                    <div className="mt-1">
                                        <CountdownTimer endTime={auction.end_time} />
                                    </div>
                                </div>
                            </div>

                            {!isEnded ? (
                                <div className="space-y-6">
                                    {/* Bidding Form */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-muted-foreground uppercase">Place Your Bid</span>
                                            <div className="flex items-center gap-2 text-primary">
                                                <Wallet className="w-4 h-4 text-accent" />
                                                <span>Balance: ₹{balance.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="relative flex-1">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 font-bold">₹</span>
                                                <Input
                                                    type="number"
                                                    placeholder={`${currentMaxBid + 100}+`}
                                                    value={bidAmount}
                                                    onChange={(e) => setBidAmount(e.target.value)}
                                                    className="h-14 pl-10 text-xl font-bold border-2 focus:border-accent transition-all bg-background"
                                                />
                                            </div>
                                            <Button
                                                onClick={handlePlaceBid}
                                                disabled={isBidding}
                                                className="h-14 px-8 bg-accent hover:bg-black hover:text-white text-accent-foreground font-black text-lg shadow-xl hover:shadow-accent/20 transition-all uppercase"
                                            >
                                                {isBidding ? "Processing..." : "Bid Now"}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-4 bg-accent/5 text-accent text-xs font-bold rounded-lg border border-accent/10 italic">
                                        <ShieldCheck className="w-4 h-4" />
                                        Bidding amount will be held in your wallet till the auction ends.
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 bg-accent/10 border-2 border-accent/20 rounded-2xl text-center space-y-4">
                                    <h3 className="text-2xl font-black text-primary uppercase">Auction Ended</h3>
                                    {isWinner ? (
                                        <div className="space-y-4">
                                            <p className="text-sm text-accent font-bold">🎉 CONGRATULATIONS! YOU WON THIS AUCTION!</p>
                                            <Button
                                                onClick={handleCheckout}
                                                className="w-full bg-accent hover:bg-black hover:text-white text-accent-foreground font-black h-12 uppercase"
                                            >
                                                Claim Your Coin (Proceed to Checkout)
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">This auction has successfully closed.</p>
                                    )}
                                </div>
                            )}
                        </Card>

                        {/* Bid History */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-black flex items-center gap-2 text-primary">
                                <History className="w-5 h-5 text-accent" />
                                BID HISTORY
                            </h3>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {bids.length > 0 ? (
                                    bids.map((bid, index) => (
                                        <div key={bid.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${index === 0 ? 'bg-accent/10 border-accent shadow-md' : 'bg-card border-border/50 opacity-80'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-primary">
                                                        {bid.user_profiles?.full_name || 'Anonymous Collector'}
                                                        {bid.user_id === user?.id && <span className="ml-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded">YOU</span>}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground lowercase">{format(new Date(bid.created_at), 'MMM dd, HH:mm:ss')}</p>
                                                </div>
                                            </div>
                                            <div className="text-lg font-black text-primary">
                                                ₹{Number(bid.amount).toLocaleString()}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center bg-card rounded-2xl border-2 border-dashed border-border opacity-50">
                                        <p className="text-sm font-bold text-muted-foreground">No bids placed yet.</p>
                                        <p className="text-[10px] uppercase tracking-widest mt-1">Be the first to bid!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </main>
    )
}

"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { Gavel, Timer, Coins } from "lucide-react"
import { CountdownTimer } from "@/components/countdown-timer"

export default function AuctionsPage() {
    const [auctions, setAuctions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchAuctions() {
            try {
                const { data, error } = await supabase
                    .from("auctions")
                    .select("*, coins(*), bids(amount)")
                    .order("end_time", { ascending: true })

                if (error) throw error
                setAuctions(data || [])
            } catch (error) {
                console.error("Error fetching auctions:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAuctions()
    }, [])

    return (
        <main className="min-h-screen flex flex-col bg-background">
            <Header />

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
                <div className="flex items-center gap-4 mb-12">
                    <div className="p-3 bg-accent/20 rounded-2xl">
                        <Gavel className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-primary">Live Auctions</h1>
                        <p className="text-muted-foreground">Bid on rare coins and premium collectibles</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-80 bg-card animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : auctions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {auctions.map((auction) => {
                            const maxBid = auction.bids?.length > 0
                                ? Math.max(...auction.bids.map((b: any) => Number(b.amount)))
                                : Number(auction.min_price)

                            const isEnded = new Date(auction.end_time) < new Date()

                            return (
                                <Card key={auction.id} className={`overflow-hidden flex flex-col hover:shadow-xl transition-all ${isEnded ? 'opacity-70' : 'hover:-translate-y-1'}`}>
                                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 relative flex items-center justify-center group">
                                        <div className="animate-coin">
                                            <Coins className="w-24 h-24 text-accent/30" />
                                        </div>
                                        {auction.coins?.image_url && (
                                            <img src={auction.coins.image_url} alt={auction.coins.name} className="absolute inset-0 w-full h-full object-contain p-8" />
                                        )}

                                        {/* Status Badge */}
                                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${auction.status === 'active' ? 'bg-green-500 text-white' :
                                                isEnded ? 'bg-destructive text-white' : 'bg-primary text-white'
                                            }`}>
                                            {auction.status === 'active' ? '● LIVE' : isEnded ? 'ENDED' : 'UPCOMING'}
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-4 flex-1 flex flex-col">
                                        <div>
                                            <h3 className="text-lg font-bold line-clamp-1">{auction.coins?.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-1">Starting Price: ₹{auction.min_price}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-3 border-y border-border">
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Current Bid</p>
                                                <p className="text-xl font-black text-primary">₹{maxBid.toLocaleString()}</p>
                                            </div>
                                            <div className="border-l border-border pl-4">
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Time Left</p>
                                                <div className="text-sm font-bold flex items-center gap-1">
                                                    <Timer className="w-3 h-3 text-accent" />
                                                    <CountdownTimer endTime={auction.end_time} />
                                                </div>
                                            </div>
                                        </div>

                                        <Link href={`/auctions/${auction.id}`} className="mt-auto">
                                            <Button className={`w-full font-bold h-12 ${isEnded ? 'bg-muted' : 'bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20'}`}>
                                                {isEnded ? "View Results" : "Place Your Bid"}
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-secondary/10 rounded-3xl border-2 border-dashed border-border">
                        <Coins className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-muted-foreground">No auctions found</h3>
                        <p className="text-muted-foreground/70">Check back soon for upcoming bidding events!</p>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    )
}

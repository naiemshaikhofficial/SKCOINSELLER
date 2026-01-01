"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Gavel, Plus, Timer, Coins, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default function AdminAuctionsPage() {
    const [auctions, setAuctions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchAuctions()
    }, [])

    async function fetchAuctions() {
        try {
            const { data, error } = await supabase
                .from("auctions")
                .select("*, coins(*), bids(count)")
                .order("created_at", { ascending: false })

            if (error) throw error
            setAuctions(data || [])
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    async function updateStatus(id: string, status: string) {
        const { error } = await supabase.from("auctions").update({ status }).eq("id", id)
        if (!error) fetchAuctions()
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/20 rounded-lg">
                        <Gavel className="w-6 h-6 text-accent" />
                    </div>
                    <h1 className="text-3xl font-bold">Manage Auctions</h1>
                </div>
                <Link href="/admin/auctions/create">
                    <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Auction
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-card animate-pulse rounded-xl" />)}
                </div>
            ) : auctions.length > 0 ? (
                <div className="grid gap-4">
                    {auctions.map((auction) => {
                        const isEnded = new Date(auction.end_time) < new Date()
                        return (
                            <Card key={auction.id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                                            <Coins className="w-8 h-8 text-accent/20" />
                                            {auction.coins?.image_url && (
                                                <img src={auction.coins.image_url} alt="" className="absolute inset-0 w-full h-full object-contain" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{auction.coins?.name}</h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Timer className="w-3 h-3" />
                                                    Ends: {format(new Date(auction.end_time), 'MMM dd, HH:mm')}
                                                </span>
                                                <span className="text-sm text-muted-foreground flex items-center gap-1 font-bold">
                                                    <Gavel className="w-3 h-3 text-accent" />
                                                    {auction.bids?.[0]?.count || 0} Bids
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${auction.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                                auction.status === 'ended' || isEnded ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                                            }`}>
                                            {auction.status}
                                        </div>

                                        <div className="flex gap-2">
                                            {auction.status === 'upcoming' && (
                                                <Button size="sm" variant="outline" onClick={() => updateStatus(auction.id, 'active')}>
                                                    Start Now
                                                </Button>
                                            )}
                                            {(auction.status === 'active' || auction.status === 'upcoming') && (
                                                <Button size="sm" variant="destructive" onClick={() => updateStatus(auction.id, 'cancelled')}>
                                                    Cancel
                                                </Button>
                                            )}
                                            {auction.status === 'active' && (
                                                <Button size="sm" variant="secondary" onClick={() => updateStatus(auction.id, 'ended')}>
                                                    End Auction
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <Card className="p-12 text-center bg-card/50 border-dashed border-2">
                    <p className="text-muted-foreground">No auctions created yet.</p>
                    <Link href="/admin/auctions/create">
                        <Button variant="link" className="text-accent underline">Create your first auction</Button>
                    </Link>
                </Card>
            )}
        </div>
    )
}

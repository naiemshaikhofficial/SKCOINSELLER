"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Gavel, Calendar, ArrowLeft, Coins } from "lucide-react"
import Link from "next/link"

export default function CreateAuctionPage() {
    const [coins, setCoins] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        coin_id: "",
        min_price: "",
        start_time: formatDateTime(new Date()),
        end_time: formatDateTime(new Date(Date.now() + 24 * 60 * 60 * 1000)), // default 24h
    })

    function formatDateTime(date: Date) {
        return date.toISOString().slice(0, 16)
    }

    useEffect(() => {
        async function fetchCoins() {
            const { data } = await supabase.from("coins").select("id, name, price")
            setCoins(data || [])
            setLoading(false)
        }
        fetchCoins()
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!formData.coin_id || !formData.min_price || !formData.end_time) {
            alert("Please fill all fields")
            return
        }

        setIsSubmitting(true)
        try {
            const { error } = await supabase.from("auctions").insert({
                coin_id: formData.coin_id,
                min_price: Number(formData.min_price),
                start_time: new Date(formData.start_time).toISOString(),
                end_time: new Date(formData.end_time).toISOString(),
                status: new Date(formData.start_time) <= new Date() ? 'active' : 'upcoming'
            })

            if (error) throw error
            router.push("/admin/auctions")
        } catch (error) {
            console.error("Error creating auction:", error)
            alert("Failed to create auction.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <Link href="/admin/auctions" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Auctions
            </Link>

            <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                    <Gavel className="w-6 h-6 text-accent" />
                </div>
                <h1 className="text-3xl font-bold">Launch New Auction</h1>
            </div>

            <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6">

                        <div className="space-y-2">
                            <Label>Select Coin</Label>
                            <select
                                className="w-full h-12 bg-background border-2 rounded-lg px-4 focus:border-accent outline-none"
                                value={formData.coin_id}
                                onChange={(e) => setFormData({ ...formData, coin_id: e.target.value })}
                            >
                                <option value="">-- Choose a coin --</option>
                                {coins.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} (Market: ₹{c.price})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Minimum/Starting Price (₹)</Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="pl-8 h-12"
                                        value={formData.min_price}
                                        onChange={(e) => setFormData({ ...formData, min_price: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-accent" />
                                    Start Time
                                </Label>
                                <Input
                                    type="datetime-local"
                                    className="h-12"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-accent" />
                                    End Time (Auction Close)
                                </Label>
                                <Input
                                    type="datetime-local"
                                    className="h-12"
                                    value={formData.end_time}
                                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                />
                            </div>
                        </div>

                    </div>

                    <div className="pt-4 flex gap-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-12 text-lg"
                        >
                            {isSubmitting ? "Creating..." : "Launch Auction"}
                        </Button>
                        <Link href="/admin/auctions" className="flex-1">
                            <Button type="button" variant="outline" className="w-full h-12">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </Card>

            <div className="p-6 bg-accent/5 rounded-2xl border-2 border-accent/10 flex gap-4">
                <Coins className="w-8 h-8 text-accent shrink-0" />
                <p className="text-sm text-muted-foreground italic">
                    Tip: Auctions with lower starting prices usually attract more bidders. Ensure your end time gives enough time for a healthy competition.
                </p>
            </div>
        </div>
    )
}

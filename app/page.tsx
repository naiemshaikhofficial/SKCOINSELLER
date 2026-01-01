"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { Coins as Coin, Gavel, Timer } from "lucide-react"
import { Footer } from "@/components/footer"
import { CountdownTimer } from "@/components/countdown-timer"

export default function Home() {
  const [coins, setCoins] = useState<any[]>([])
  const [auctions, setAuctions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [auctionsLoading, setAuctionsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchCoins() {
      try {
        const { data, error } = await supabase.from("coins").select("*").limit(6)
        if (error) throw error
        setCoins(data || [])
      } catch (error) {
        console.error("Error fetching coins:", error)
      } finally {
        setLoading(false)
      }
    }

    async function fetchAuctions() {
      try {
        const { data, error } = await supabase
          .from("auctions")
          .select("*, coins(*), bids(amount)")
          .eq("status", "active")
          .order("end_time", { ascending: true })

        if (error) throw error
        setAuctions(data || [])
      } catch (error) {
        console.error("Error fetching auctions:", error)
      } finally {
        setAuctionsLoading(false)
      }
    }

    fetchCoins()
    fetchAuctions()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Header />

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-6 animate-slide-in">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl font-bold text-primary">Premium Coins & Collectibles</h1>
                <p className="text-lg text-foreground/70">
                  Discover rare, investment-grade coins from around the world. Authenticate, certified collections for
                  serious collectors.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/shop">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Browse Collection
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-accent">500+</div>
                  <p className="text-sm text-foreground/60">Premium Coins</p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-accent">10K+</div>
                  <p className="text-sm text-foreground/60">Happy Collectors</p>
                </div>
              </div>
            </div>

            {/* Right - Animated Coins */}
            <div className="flex items-center justify-center gap-8">
              <div className="animate-coin w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
                <Coin className="w-16 h-16 text-primary-foreground" />
              </div>
              <div className="animate-float">
                <div className="animate-coin w-24 h-24 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg opacity-80">
                  <span className="text-4xl">₹</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Auctions Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Gavel className="w-8 h-8 text-accent animate-bounce" />
              Live Bidding
            </h2>
            <Link href="/auctions" className="text-accent hover:underline font-semibold">
              View All Auctions →
            </Link>
          </div>

          {auctionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-card animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : auctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {auctions.map((auction) => {
                const maxBid = auction.bids?.length > 0
                  ? Math.max(...auction.bids.map((b: any) => Number(b.amount)))
                  : Number(auction.min_price)

                return (
                  <Card key={auction.id} className="p-6 border-2 border-accent/20 bg-gradient-to-br from-card to-accent/5 overflow-hidden group">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="w-full sm:w-40 aspect-square bg-primary/10 rounded-xl flex items-center justify-center relative">
                        <div className="animate-coin">
                          <Coin className="w-20 h-20 text-accent opacity-20" />
                        </div>
                        {auction.coins?.image_url && (
                          <img src={auction.coins.image_url} alt={auction.coins.name} className="absolute inset-0 w-full h-full object-contain" />
                        )}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors">{auction.coins?.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-foreground/60 mt-1">
                            <Timer className="w-4 h-4" />
                            <span>Time Left:</span>
                            <CountdownTimer endTime={auction.end_time} />
                          </div>
                        </div>

                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-xs text-foreground/60 uppercase font-medium">Highest Bid</p>
                            <p className="text-3xl font-black text-primary">₹{maxBid.toLocaleString()}</p>
                          </div>
                          <Link href={`/auctions/${auction.id}`}>
                            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8 shadow-lg shadow-accent/20">
                              Bid Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-card/50 rounded-3xl border-2 border-dashed border-border">
              <Gavel className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
              <p className="text-lg text-foreground/50">No auctions currently live. Check back later!</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Refresh</Button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Coins */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Coins</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-background rounded-lg h-80 animate-shimmer" />
              ))}
            </div>
          ) : coins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {coins.map((coin) => (
                <Link key={coin.id} href={`/product/${coin.id}`}>
                  <Card className="hover:shadow-lg transition hover:scale-105 cursor-pointer h-full overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden flex items-center justify-center group">
                      <div className="animate-coin group-hover:pause-animation">
                        <Coin className="w-24 h-24 text-primary" />
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-lg line-clamp-2">{coin.name}</h3>
                      <p className="text-sm text-foreground/60 line-clamp-2">{coin.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-2xl font-bold text-primary">₹{coin.price}</span>
                        <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                          {coin.quantity_available > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-foreground/60">No coins available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary via-primary to-accent rounded-2xl p-8 sm:p-12 text-center shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">Start Your Collection Today</h2>
          <p className="text-lg text-primary-foreground/95 mb-6">
            Join thousands of collectors trusting Skoins for premium coins and collectibles
          </p>
          <Link href="/shop">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg hover:shadow-xl transition-all">
              Explore Collection
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}

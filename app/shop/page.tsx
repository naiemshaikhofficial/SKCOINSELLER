"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { CoinsIcon as CoinIcon, ShoppingCart } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function ShopPage() {
  const [coins, setCoins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [rarityFilter, setRarityFilter] = useState("")
  const supabase = createClient()

  useEffect(() => {
    async function fetchCoins() {
      try {
        let query = supabase.from("coins").select("*")

        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        }
        if (rarityFilter) {
          query = query.eq("rarity_level", rarityFilter)
        }

        const { data, error } = await query

        if (error) throw error
        setCoins(data || [])
      } catch (error) {
        console.error("Error fetching coins:", error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      setLoading(true)
      fetchCoins()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, rarityFilter])

  const addToCart = async (coinId: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = "/auth/login"
      return
    }

    try {
      const { error } = await supabase.from("cart_items").upsert(
        {
          user_id: user.id,
          coin_id: coinId,
          quantity: 1,
        },
        {
          onConflict: "user_id,coin_id",
        },
      )

      if (error) throw error
      alert("Added to cart!")
    } catch (error) {
      console.error("Error adding to cart:", error)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold text-primary">Shop Coins</h1>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Search coins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card"
            />

            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground"
            >
              <option value="">All Rarity Levels</option>
              <option value="Common">Common</option>
              <option value="Uncommon">Uncommon</option>
              <option value="Rare">Rare</option>
              <option value="Very Rare">Very Rare</option>
              <option value="Legendary">Legendary</option>
            </select>
          </div>
        </div>

        {/* Coins Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-background rounded-lg h-80 animate-shimmer" />
            ))}
          </div>
        ) : coins.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coins.map((coin) => (
              <Card key={coin.id} className="overflow-hidden hover:shadow-lg transition hover:scale-105 flex flex-col">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden flex items-center justify-center group">
                  <div className="animate-coin group-hover:pause-animation">
                    <CoinIcon className="w-20 h-20 text-primary" />
                  </div>
                </div>
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                  <Link href={`/product/${coin.id}`}>
                    <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition">{coin.name}</h3>
                  </Link>
                  <p className="text-xs text-foreground/60">{coin.year}</p>
                  <p className="text-sm text-foreground/60 line-clamp-2 flex-1">{coin.description}</p>

                  <div className="space-y-2 border-t border-border pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">₹{coin.price}</span>
                      <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">{coin.rarity_level}</span>
                    </div>
                    <Button
                      onClick={() => addToCart(coin.id)}
                      className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
                      disabled={coin.quantity_available === 0}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {coin.quantity_available > 0 ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <CoinIcon className="w-16 h-16 mx-auto text-foreground/30 mb-4" />
            <p className="text-lg text-foreground/60">No coins found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </main>
  )
}

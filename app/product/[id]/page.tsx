"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase-client"
import { CoinsIcon as CoinIcon, ShoppingCart, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProductPage() {
  const params = useParams()
  const [coin, setCoin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const supabase = createClient()

  useEffect(() => {
    async function fetchCoin() {
      try {
        const { data, error } = await supabase.from("coins").select("*").eq("id", params.id).single()

        if (error) throw error
        setCoin(data)
      } catch (error) {
        console.error("Error fetching coin:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCoin()
  }, [params.id])

  const addToCart = async () => {
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
          coin_id: params.id,
          quantity: quantity,
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

      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/shop">
          <Button variant="ghost" className="mb-6 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Button>
        </Link>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-background rounded-lg h-96 animate-shimmer" />
            <div className="space-y-4">
              <div className="bg-background rounded h-8 w-3/4 animate-shimmer" />
              <div className="bg-background rounded h-4 w-full animate-shimmer" />
              <div className="bg-background rounded h-4 w-full animate-shimmer" />
            </div>
          </div>
        ) : coin ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
              <div className="animate-coin">
                <CoinIcon className="w-32 h-32 text-primary" />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-primary mb-2">{coin.name}</h1>
                <div className="flex gap-4 text-sm text-foreground/60">
                  <span>Year: {coin.year}</span>
                  <span>Metal: {coin.metal}</span>
                  <span className="bg-accent/20 text-accent px-2 py-1 rounded">{coin.rarity_level}</span>
                </div>
              </div>

              <Card className="p-6 bg-primary/5">
                <div className="text-5xl font-bold text-primary mb-2">₹{coin.price.toFixed(2)}</div>
                <p className="text-sm text-foreground/60">
                  {coin.quantity_available > 0 ? `${coin.quantity_available} in stock` : "Out of stock"}
                </p>
              </Card>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Description</h3>
                <p className="text-foreground/70 leading-relaxed">{coin.description}</p>
              </div>

              <Card className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-4">Coin Specifications</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-foreground/60">Weight</p>
                      <p className="font-medium">{coin.weight}g</p>
                    </div>
                    <div>
                      <p className="text-foreground/60">Purity</p>
                      <p className="font-medium">{coin.purity}</p>
                    </div>
                    <div>
                      <p className="text-foreground/60">Metal</p>
                      <p className="font-medium">{coin.metal}</p>
                    </div>
                    <div>
                      <p className="text-foreground/60">Rarity</p>
                      <p className="font-medium">{coin.rarity_level}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center gap-4">
                  <label className="font-medium">Quantity:</label>
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-background"
                    >
                      −
                    </button>
                    <span className="px-4 py-2">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(coin.quantity_available, quantity + 1))}
                      className="px-3 py-2 hover:bg-background"
                    >
                      +
                    </button>
                  </div>
                </div>

                <Button
                  onClick={addToCart}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
                  disabled={coin.quantity_available === 0}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {coin.quantity_available > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-foreground/60">Coin not found</p>
          </div>
        )}
      </div>
    </main>
  )
}

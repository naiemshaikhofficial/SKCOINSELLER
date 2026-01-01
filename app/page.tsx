"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { Coins as Coin } from "lucide-react"

export default function Home() {
  const [coins, setCoins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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

    fetchCoins()
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
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-accent rounded-xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Start Your Collection Today</h2>
          <p className="text-lg text-primary-foreground/90 mb-6">
            Join thousands of collectors investing in premium coins
          </p>
          <Link href="/shop">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12 px-4 mt-16">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="hover:underline">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:underline">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>📞 +91-9876543210</li>
              <li>📧 info@skcoinseller.com</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Policies</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:underline">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:underline">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Payment Methods</h3>
            <p className="text-sm">PhonePe • Razorpay • PayPal</p>
          </div>
        </div>
        <div className="border-t border-secondary-foreground/20 pt-8 text-center text-sm">
          <p>&copy; 2026 SK Coin Seller. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

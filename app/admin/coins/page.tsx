"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase-client"
import { isAdmin } from "@/lib/admin-check"
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Footer } from "@/components/footer"

export default function AdminCoinsPage() {
  const [coins, setCoins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const admin = await isAdmin()
      if (!admin) {
        router.push("/auth/login")
        return
      }
      setCheckingAuth(false)
      fetchCoins()
    }

    checkAuth()
  }, [router])

  async function fetchCoins() {
    try {
      const { data, error } = await supabase.from("coins").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setCoins(data || [])
    } catch (error) {
      console.error("Error fetching coins:", error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteCoin(id: string) {
    if (!confirm("Are you sure you want to delete this coin?")) return

    try {
      const { error } = await supabase.from("coins").delete().eq("id", id)

      if (error) throw error
      setCoins(coins.filter((c) => c.id !== id))
    } catch (error) {
      console.error("Error deleting coin:", error)
    }
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <Footer />
    </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">Manage Coins</h1>
          <Button
            onClick={() => router.push("/admin/coins/add")}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Coin
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : coins.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-4 px-4 font-semibold">Image</th>
                  <th className="text-left py-4 px-4 font-semibold">Name</th>
                  <th className="text-left py-4 px-4 font-semibold">Price</th>
                  <th className="text-left py-4 px-4 font-semibold">Year</th>
                  <th className="text-left py-4 px-4 font-semibold">Quantity</th>
                  <th className="text-left py-4 px-4 font-semibold">Rarity</th>
                  <th className="text-right py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coins.map((coin) => (
                  <tr key={coin.id} className="border-b border-border hover:bg-secondary/5 transition">
                    <td className="py-4 px-4">
                      {coin.image_url ? (
                        <div className="relative w-12 h-12">
                          <Image
                            src={coin.image_url}
                            alt={coin.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-secondary/20 rounded" />
                      )}
                    </td>
                    <td className="py-4 px-4">{coin.name}</td>
                    <td className="py-4 px-4">₹{coin.price}</td>
                    <td className="py-4 px-4">{coin.year}</td>
                    <td className="py-4 px-4">{coin.quantity_available}</td>
                    <td className="py-4 px-4">
                      <span className="bg-accent/20 text-accent text-xs px-2 py-1 rounded">{coin.rarity_level}</span>
                    </td>
                    <td className="py-4 px-4 flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/coins/${coin.id}/edit`)}
                        className="flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive bg-transparent"
                        onClick={() => deleteCoin(coin.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-foreground/60">No coins yet. Create your first coin!</p>
          </Card>
        )}
      </div>
      <Footer />
    </main>
  )
}

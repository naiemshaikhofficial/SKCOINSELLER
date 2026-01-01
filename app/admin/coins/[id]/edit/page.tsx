"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase-client"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EditCoinPage() {
  const params = useParams()
  const router = useRouter()
  const [coin, setCoin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    year: "",
    metal: "",
    weight: "",
    purity: "",
    rarity_level: "Common",
    quantity_available: "",
    image_url: "",
  })
  const supabase = createClient()

  useEffect(() => {
    async function fetchCoin() {
      try {
        const { data, error } = await supabase.from("coins").select("*").eq("id", params.id).single()

        if (error) throw error
        setCoin(data)
        setFormData(data)
      } catch (error) {
        console.error("Error fetching coin:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCoin()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from("coins")
        .update({
          ...formData,
          price: Number.parseFloat(formData.price),
          year: Number.parseInt(formData.year),
          weight: Number.parseFloat(formData.weight),
          quantity_available: Number.parseInt(formData.quantity_available),
        })
        .eq("id", params.id)

      if (error) throw error
      router.push("/admin/coins")
    } catch (error) {
      console.error("Error updating coin:", error)
      alert("Failed to update coin")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <Header />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/admin/coins">
          <Button variant="ghost" className="mb-6 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Coins
          </Button>
        </Link>

        <Card className="p-8">
          <h1 className="text-2xl font-bold text-primary mb-6">Edit Coin</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Coin Name</label>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Gold Sovereign" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹)</label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="5000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Input name="year" type="number" value={formData.year} onChange={handleChange} placeholder="2023" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Metal</label>
                <Input name="metal" value={formData.metal} onChange={handleChange} placeholder="Gold" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Weight (g)</label>
                <Input
                  name="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="31.1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Purity</label>
                <Input name="purity" value={formData.purity} onChange={handleChange} placeholder="99.9%" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rarity Level</label>
                <select
                  name="rarity_level"
                  value={formData.rarity_level}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground"
                >
                  <option>Common</option>
                  <option>Uncommon</option>
                  <option>Rare</option>
                  <option>Very Rare</option>
                  <option>Legendary</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity Available</label>
                <Input
                  name="quantity_available"
                  type="number"
                  value={formData.quantity_available}
                  onChange={handleChange}
                  placeholder="10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed description..."
                className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground resize-none"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/coin.jpg"
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}

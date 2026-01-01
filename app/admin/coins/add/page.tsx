"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ImageUploader } from "@/components/image-uploader"
import { createClient } from "@/lib/supabase-client"
import { isAdmin } from "@/lib/admin-check"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AddCoinPage() {
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const admin = await isAdmin()
      if (!admin) {
        router.push('/auth/login')
        return
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, image_url: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!formData.image_url) {
        throw new Error("Please upload an image")
      }

      const { error: insertError } = await supabase.from("coins").insert([
        {
          ...formData,
          price: Number.parseFloat(formData.price),
          year: Number.parseInt(formData.year),
          weight: Number.parseFloat(formData.weight),
          quantity_available: Number.parseInt(formData.quantity_available),
        },
      ])

      if (insertError) throw insertError
      router.push("/admin/coins")
    } catch (err: any) {
      setError(err.message || "Failed to add coin")
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
          <h1 className="text-2xl font-bold text-primary mb-6">Add New Coin</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

            <div className="space-y-2">
              <label className="text-sm font-medium">Coin Image *</label>
              <ImageUploader
                onUploadComplete={handleImageUpload}
                currentImageUrl={formData.image_url}
                path="coins"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Coin Name *</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Gold Sovereign"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹) *</label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="5000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Year *</label>
                <Input
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  placeholder="2023"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Metal *</label>
                <Input
                  name="metal"
                  value={formData.metal}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Gold, Silver"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Weight (g) *</label>
                <Input
                  name="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  placeholder="31.1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Purity *</label>
                <Input
                  name="purity"
                  value={formData.purity}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 99.9%"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rarity Level *</label>
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
                <label className="text-sm font-medium">Quantity Available *</label>
                <Input
                  name="quantity_available"
                  type="number"
                  value={formData.quantity_available}
                  onChange={handleChange}
                  required
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
                placeholder="Detailed description of the coin..."
                className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground resize-none"
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Adding Coin..." : "Add Coin"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}

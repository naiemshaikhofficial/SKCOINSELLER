"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ImageUploader } from "@/components/image-uploader"
import { CoinButton } from "@/components/ui/coin-button"
import { CoinLoader } from "@/components/ui/coin-loader"
import { createClient } from "@/lib/supabase-client"
import { isAdmin } from "@/lib/admin-check"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/footer"

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
      <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <CoinLoader size="lg" />
      <Footer />
    </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-200 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-200 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <Header />

      <div className="relative max-w-3xl mx-auto px-4 py-12">
        <Link href="/admin/coins">
          <CoinButton variant="outline" size="sm" className="mb-6 bg-white/50 backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Coins
          </CoinButton>
        </Link>

        <Card className="p-8 glass-card shadow-2xl border-2 border-yellow-100/50 stagger-item">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-gold rounded-full coin-float">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gold bg-gradient-gold bg-clip-text text-transparent">
              Add New Coin
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium slideInUp">
                {error}
              </div>
            )}

            {/* Image Upload Section */}
            <div className="space-y-2 stagger-item">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="text-yellow-500">★</span> Coin Image
              </label>
              <ImageUploader
                onUploadComplete={handleImageUpload}
                currentImageUrl={formData.image_url}
                path="coins"
              />
            </div>

            {/* Form Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2 stagger-item">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Coin Name *</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Gold Sovereign"
                  className="coin-input border-2 focus:border-yellow-400 transition-all"
                />
              </div>

              <div className="space-y-2 stagger-item">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Price (₹) *</label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="5000"
                  className="coin-input border-2 focus:border-yellow-400 transition-all"
                />
              </div>

              <div className="space-y-2 stagger-item">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Year *</label>
                <Input
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  placeholder="2023"
                  className="coin-input border-2 focus:border-yellow-400 transition-all"
                />
              </div>

              <div className="space-y-2 stagger-item">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Metal *</label>
                <Input
                  name="metal"
                  value={formData.metal}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Gold, Silver"
                  className="coin-input border-2 focus:border-yellow-400 transition-all"
                />
              </div>

              <div className="space-y-2 stagger-item">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Weight (g) *</label>
                <Input
                  name="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  placeholder="31.1"
                  className="coin-input border-2 focus:border-yellow-400 transition-all"
                />
              </div>

              <div className="space-y-2 stagger-item">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Purity *</label>
                <Input
                  name="purity"
                  value={formData.purity}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 99.9%"
                  className="coin-input border-2 focus:border-yellow-400 transition-all"
                />
              </div>

              <div className="space-y-2 stagger-item">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Rarity Level *</label>
                <select
                  name="rarity_level"
                  value={formData.rarity_level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-yellow-400 bg-white dark:bg-gray-800 text-foreground transition-all outline-none"
                >
                  <option>Common</option>
                  <option>Uncommon</option>
                  <option>Rare</option>
                  <option>Very Rare</option>
                  <option>Legendary</option>
                </select>
              </div>

              <div className="space-y-2 stagger-item">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity Available *</label>
                <Input
                  name="quantity_available"
                  type="number"
                  value={formData.quantity_available}
                  onChange={handleChange}
                  required
                  placeholder="10"
                  className="coin-input border-2 focus:border-yellow-400 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 stagger-item">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed description of the coin..."
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-yellow-400 bg-white dark:bg-gray-800 text-foreground resize-none transition-all outline-none min-h-[100px]"
                rows={4}
              />
            </div>

            <CoinButton
              type="submit"
              variant="gold"
              size="lg"
              className="w-full text-lg font-bold shadow-xl"
              loading={loading}
              disabled={loading}
            >
              <Sparkles className="w-5 h-5" />
              {loading ? "Adding Coin..." : "Add Coin"}
            </CoinButton>
          </form>
        </Card>
      </div>
      <Footer />
    </main>
  )
}

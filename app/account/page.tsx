"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { User, MapPin, ShoppingBag, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/footer"

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push("/auth/login")
          return
        }

        setUser(authUser)
      } catch (error) {
        console.error("Error:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <Header />
        <div className="flex items-center justify-center py-16">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-primary mb-8">My Account</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Link href="/account/profile">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">My Profile</h2>
                  <p className="text-sm text-foreground/60">Edit personal info</p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Orders Card */}
          <Link href="/orders">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">My Orders</h2>
                  <p className="text-sm text-foreground/60">View order history</p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Addresses Card */}
          <Link href="/account/addresses">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Addresses</h2>
                  <p className="text-sm text-foreground/60">Manage delivery addresses</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Account Info */}
        <Card className="mt-8 p-6 space-y-4">
          <h2 className="text-xl font-bold">Account Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-foreground/60 mb-1">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-1">Member Since</p>
              <p className="font-medium">
                {new Date(user?.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </Card>

        {/* Quick Links */}
        <Card className="mt-8 p-6 space-y-4">
          <h2 className="text-xl font-bold">Quick Links</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <Link href="/shop">
              <Button variant="outline" className="w-full bg-transparent">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <Footer />
    </main>
  )
}

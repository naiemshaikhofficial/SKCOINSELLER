"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase-client"
import { User, Loader2, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  full_name: string
  phone: string
  avatar_url: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState("")
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push("/auth/login")
          return
        }

        setUser(authUser)
        setEmail(authUser.email || "")

        const { data, error } = await supabase.from("user_profiles").select("*").eq("id", authUser.id).single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setProfile(data)
          setFormData({
            full_name: data.full_name || "",
            phone: data.phone || "",
            avatar_url: data.avatar_url || "",
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)

    try {
      if (profile) {
        // Update existing profile
        const { error } = await supabase.from("user_profiles").update(formData).eq("id", user.id)

        if (error) throw error
      } else {
        // Create new profile
        const { error } = await supabase.from("user_profiles").insert([
          {
            id: user.id,
            ...formData,
          },
        ])

        if (error) throw error
      }

      setProfile({ id: user.id, ...formData })
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
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
        <h1 className="text-3xl font-bold text-primary mb-8">My Profile</h1>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="p-8">
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{formData.full_name || "User"}</h2>
                  <p className="text-foreground/60">{email}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 pt-6 border-t border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input value={email} disabled className="bg-muted" />
                  <p className="text-xs text-foreground/50">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="John Doe" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+91-9876543210" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Avatar URL</label>
                  <Input
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2 bg-transparent">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          </Card>

          {/* Account Summary */}
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Account Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/5 rounded-lg">
                <p className="text-sm text-foreground/60 mb-1">Member Since</p>
                <p className="font-semibold">
                  {new Date(user?.created_at).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="p-4 bg-secondary/5 rounded-lg">
                <p className="text-sm text-foreground/60 mb-1">Account Status</p>
                <p className="font-semibold text-green-600">Active</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase-client"
import { Plus, Edit2, Trash2, Loader2, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

interface Address {
  id: string
  full_name: string
  phone: string
  street: string
  city: string
  state: string
  postal_code: string
  is_default: boolean
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    is_default: false,
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push("/auth/login")
          return
        }

        setUser(authUser)

        const { data, error } = await supabase.from("addresses").select("*").eq("user_id", authUser.id)

        if (error) throw error
        setAddresses(data || [])
      } catch (error) {
        console.error("Error fetching addresses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAddresses()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const resetForm = () => {
    setFormData({
      full_name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postal_code: "",
      is_default: false,
    })
    setEditingId(null)
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)

    try {
      if (editingId) {
        // Update existing address
        const { error } = await supabase.from("addresses").update(formData).eq("id", editingId)

        if (error) throw error

        setAddresses(addresses.map((a) => (a.id === editingId ? { ...formData, id: editingId } : a)))
      } else {
        // Create new address
        const { data, error } = await supabase
          .from("addresses")
          .insert([
            {
              user_id: user.id,
              ...formData,
            },
          ])
          .select()

        if (error) throw error

        if (data) {
          setAddresses([...addresses, data[0]])
        }
      }

      resetForm()
      setShowForm(false)
      alert("Address saved successfully!")
    } catch (error) {
      console.error("Error saving address:", error)
      alert("Failed to save address")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (address: Address) => {
    setFormData(address)
    setEditingId(address.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    try {
      const { error } = await supabase.from("addresses").delete().eq("id", id)

      if (error) throw error
      setAddresses(addresses.filter((a) => a.id !== id))
    } catch (error) {
      console.error("Error deleting address:", error)
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

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">Delivery Addresses</h1>
          {!showForm && (
            <Button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </Button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="p-6 mb-8 space-y-4">
            <h2 className="text-xl font-bold">{editingId ? "Edit Address" : "Add New Address"}</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91-9876543210"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Street Address</label>
                <Input
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input name="city" value={formData.city} onChange={handleChange} placeholder="Mumbai" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Input name="state" value={formData.state} onChange={handleChange} placeholder="Maharashtra" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Postal Code</label>
                <Input
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  placeholder="400001"
                  required
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
                <label className="text-sm">Set as default address</label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {saving ? "Saving..." : "Save Address"}
              </Button>
              <Button
                onClick={() => {
                  resetForm()
                  setShowForm(false)
                }}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <Card className="p-8 text-center">
            <MapPin className="w-16 h-16 mx-auto text-foreground/30 mb-4" />
            <p className="text-lg text-foreground/60 mb-6">No addresses saved yet</p>
            <Button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="bg-primary hover:bg-primary/90"
            >
              Add Your First Address
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <Card key={address.id} className={`p-6 relative ${address.is_default ? "border-primary border-2" : ""}`}>
                {address.is_default && (
                  <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    Default
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{address.full_name}</h3>
                    <p className="text-sm text-foreground/60">{address.phone}</p>
                  </div>

                  <div className="text-sm text-foreground/70">
                    <p>{address.street}</p>
                    <p>
                      {address.city}, {address.state} {address.postal_code}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(address)}
                      className="flex-1 bg-transparent flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(address.id)}
                      className="flex-1 bg-transparent text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

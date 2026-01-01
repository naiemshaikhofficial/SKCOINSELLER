"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { Trash2, ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface CartItemWithCoin {
  id: string
  user_id: string
  coin_id: string
  quantity: number
  coin: {
    id: string
    name: string
    price: number
    description: string
  }
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemWithCoin[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchCart() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push("/auth/login")
          return
        }

        setUser(authUser)

        const { data, error } = await supabase
          .from("cart_items")
          .select(
            `
          id,
          user_id,
          coin_id,
          quantity,
          coin:coins(id, name, price, description)
        `,
          )
          .eq("user_id", authUser.id)

        if (error) throw error
        setCartItems(data || [])
      } catch (error) {
        console.error("Error fetching cart:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])

  const removeItem = async (cartItemId: string) => {
    try {
      const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId)

      if (error) throw error
      setCartItems(cartItems.filter((item) => item.id !== cartItemId))
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(cartItemId)
      return
    }

    try {
      const { error } = await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", cartItemId)

      if (error) throw error
      setCartItems(cartItems.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item)))
    } catch (error) {
      console.error("Error updating quantity:", error)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.coin?.price || 0) * item.quantity, 0)
  const shipping = subtotal > 0 ? 200 : 0
  const tax = subtotal * 0.18
  const total = subtotal + shipping + tax

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
      <Header cartCount={cartItems.length} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/shop">
          <Button variant="ghost" className="mb-6 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-primary mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-lg text-foreground/60 mb-6">Your cart is empty</p>
            <Link href="/shop">
              <Button className="bg-primary hover:bg-primary/90">Start Shopping</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-6 flex gap-6">
                  {/* Item Image */}
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">₹</span>
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <Link href={`/product/${item.coin_id}`}>
                      <h3 className="font-semibold text-lg hover:text-primary transition">{item.coin?.name}</h3>
                    </Link>
                    <p className="text-sm text-foreground/60 mb-2">{item.coin?.description}</p>
                    <p className="text-lg font-bold text-primary">₹{item.coin?.price}</p>
                  </div>

                  {/* Quantity and Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-2 hover:bg-background"
                      >
                        −
                      </button>
                      <span className="px-4 py-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-2 hover:bg-background"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-sm font-semibold">₹{(item.coin?.price || 0) * item.quantity}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 sticky top-24 space-y-6">
                <h2 className="text-xl font-bold">Order Summary</h2>

                <div className="space-y-3 pb-4 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Shipping</span>
                    <span className="font-medium">₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Tax (18%)</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</span>
                </div>

                <Link href="/checkout" className="block">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                    Proceed to Checkout
                  </Button>
                </Link>

                <Button variant="outline" size="lg" className="w-full bg-transparent" asChild>
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

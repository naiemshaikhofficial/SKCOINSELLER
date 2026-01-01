"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/footer"

interface CartItem {
  id: string
  coin_id: string
  quantity: number
  coin: {
    id: string
    name: string
    price: number
  }
}

interface Address {
  full_name: string
  phone: string
  street: string
  city: string
  state: string
  postal_code: string
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("phonepay")
  const [selectedAddressId, setSelectedAddressId] = useState("")
  const [addresses, setAddresses] = useState<any[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)

  const [addressData, setAddressData] = useState<Address>({
    full_name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function initCheckout() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push("/auth/login")
          return
        }

        setUser(authUser)

        // Fetch cart items
        const { data: cartData } = await supabase
          .from("cart_items")
          .select(
            `
          id,
          coin_id,
          quantity,
          coin:coins(id, name, price)
        `,
          )
          .eq("user_id", authUser.id)

        setCartItems(cartData || [])

        // Fetch user addresses
        const { data: addressData } = await supabase.from("addresses").select("*").eq("user_id", authUser.id)

        setAddresses(addressData || [])

        // Set first address as default
        if (addressData && addressData.length > 0) {
          setSelectedAddressId(addressData[0].id)
        }
      } catch (error) {
        console.error("Error initializing checkout:", error)
      } finally {
        setLoading(false)
      }
    }

    initCheckout()
  }, [])

  const addAddress = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("addresses")
        .insert([
          {
            user_id: user.id,
            ...addressData,
          },
        ])
        .select()

      if (error) throw error

      if (data) {
        setAddresses([...addresses, data[0]])
        setSelectedAddressId(data[0].id)
        setShowAddressForm(false)
        setAddressData({
          full_name: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          postal_code: "",
        })
      }
    } catch (error) {
      console.error("Error adding address:", error)
    }
  }

  const processPayment = async () => {
    if (!selectedAddressId) {
      alert("Please select or add a delivery address")
      return
    }

    setProcessing(true)

    try {
      // Generate unique order number
      const orderNumber = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + (item.coin?.price || 0) * item.quantity, 0)
      const shipping = 200
      const tax = subtotal * 0.18
      const totalAmount = subtotal + shipping + tax

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user.id,
            order_number: orderNumber,
            total_amount: totalAmount,
            shipping_address_id: selectedAddressId,
            payment_method: paymentMethod,
            payment_status: "pending",
            order_status: "pending",
          },
        ])
        .select()

      if (orderError) throw orderError

      if (!orderData || orderData.length === 0) throw new Error("Failed to create order")

      const orderId = orderData[0].id

      // Add order items
      const orderItems = cartItems.map((item) => ({
        order_id: orderId,
        coin_id: item.coin_id,
        quantity: item.quantity,
        price: item.coin?.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart
      await supabase.from("cart_items").delete().eq("user_id", user.id)

      // Redirect to payment based on method
      if (paymentMethod === "phonepay") {
        router.push(`/payment/phonepay?orderId=${orderId}`)
      } else if (paymentMethod === "razorpay") {
        router.push(`/payment/razorpay?orderId=${orderId}`)
      } else if (paymentMethod === "paypal") {
        router.push(`/payment/paypal?orderId=${orderId}`)
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      alert("Failed to process order. Please try again.")
    } finally {
      setProcessing(false)
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

  const subtotal = cartItems.reduce((sum, item) => sum + (item.coin?.price || 0) * item.quantity, 0)
  const shipping = 200
  const tax = subtotal * 0.18
  const total = subtotal + shipping + tax

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/cart">
          <Button variant="ghost" className="mb-6 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-primary mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-primary">Delivery Address</h2>

              {addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-secondary/5 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-semibold">{address.full_name}</p>
                        <p className="text-sm text-foreground/60">{address.phone}</p>
                        <p className="text-sm">
                          {address.street}, {address.city}, {address.state} {address.postal_code}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => setShowAddressForm(!showAddressForm)}
              >
                {showAddressForm ? "Cancel" : "Add New Address"}
              </Button>

              {showAddressForm && (
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input
                        value={addressData.full_name}
                        onChange={(e) => setAddressData({ ...addressData, full_name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone</label>
                      <Input
                        value={addressData.phone}
                        onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                        placeholder="+91-9876543210"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium">Street Address</label>
                      <Input
                        value={addressData.street}
                        onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City</label>
                      <Input
                        value={addressData.city}
                        onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                        placeholder="Mumbai"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">State</label>
                      <Input
                        value={addressData.state}
                        onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Postal Code</label>
                      <Input
                        value={addressData.postal_code}
                        onChange={(e) => setAddressData({ ...addressData, postal_code: e.target.value })}
                        placeholder="400001"
                      />
                    </div>
                  </div>
                  <Button onClick={addAddress} className="w-full bg-primary hover:bg-primary/90">
                    Save Address
                  </Button>
                </div>
              )}
            </Card>

            {/* Payment Method */}
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-primary">Payment Method</h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-secondary/5 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="phonepay"
                    checked={paymentMethod === "phonepay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <p className="font-semibold">PhonePe</p>
                    <p className="text-sm text-foreground/60">Fast and secure UPI payments</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-secondary/5 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <p className="font-semibold">Razorpay</p>
                    <p className="text-sm text-foreground/60">Credit/Debit card, Wallet, Banking</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-secondary/5 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <p className="font-semibold">PayPal</p>
                    <p className="text-sm text-foreground/60">International payments</p>
                  </div>
                </label>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-24 space-y-6">
              <h2 className="text-xl font-bold">Order Summary</h2>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm pb-2 border-b border-border">
                    <div>
                      <p className="font-medium">{item.coin?.name}</p>
                      <p className="text-foreground/60">x{item.quantity}</p>
                    </div>
                    <p className="font-medium">₹{((item.coin?.price || 0) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pb-4 border-b border-border">
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

              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
                onClick={processPayment}
                disabled={processing || cartItems.length === 0}
              >
                {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {processing ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

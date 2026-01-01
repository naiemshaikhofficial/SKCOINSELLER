"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { ArrowLeft, Loader2, Package, Truck, MapPin } from "lucide-react"

interface OrderDetail {
  id: string
  order_number: string
  total_amount: number
  payment_status: string
  order_status: string
  payment_method: string
  created_at: string
  order_items: Array<{
    coin: { name: string; price: number }
    quantity: number
  }>
  shipment_tracking: {
    tracking_number: string
    current_status: string
    current_location: string
    estimated_delivery_date: string
    courier_service_id: string
  }
  addresses: {
    full_name: string
    phone: string
    street: string
    city: string
    state: string
    postal_code: string
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [trackingHistory, setTrackingHistory] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchOrder() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data, error } = await supabase
          .from("orders")
          .select(
            `
          id,
          order_number,
          total_amount,
          payment_status,
          order_status,
          payment_method,
          created_at,
          order_items(
            coin:coins(name, price),
            quantity
          ),
          shipment_tracking(
            id,
            tracking_number,
            current_status,
            current_location,
            estimated_delivery_date,
            courier_service_id
          ),
          addresses(full_name, phone, street, city, state, postal_code)
        `,
          )
          .eq("id", params.id)
          .eq("user_id", user.id)
          .single()

        if (error) throw error
        setOrder(data)

        // Fetch tracking history
        if (data.shipment_tracking?.[0]?.id) {
          const { data: history } = await supabase
            .from("tracking_history")
            .select("*")
            .eq("shipment_id", data.shipment_tracking[0].id)
            .order("timestamp", { ascending: false })

          setTrackingHistory(history || [])
        }
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700"
      case "shipped":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-700"
      case "delivered":
        return "bg-green-100 dark:bg-green-900/20 text-green-700"
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700"
      case "out_for_delivery":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-700"
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-700"
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

  if (!order) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <p className="text-center text-foreground/60">Order not found</p>
        </div>
      </main>
    )
  }

  const shipment = order.shipment_tracking?.[0]
  const address = order.addresses

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/orders">
          <Button variant="ghost" className="mb-6 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Button>
        </Link>

        <div className="space-y-6">
          {/* Order Header */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary mb-2">{order.order_number}</h1>
                <p className="text-foreground/60">
                  Placed on{" "}
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">₹{order.total_amount.toFixed(2)}</p>
                <div className="flex gap-2 mt-2 justify-end">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(order.order_status)}`}>
                    {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Tracking Status */}
          {shipment && (
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Shipment Tracking
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-foreground/60">Tracking Number</p>
                    <p className="font-mono font-bold">{shipment.tracking_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground/60">Current Status</p>
                    <span
                      className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(shipment.current_status)}`}
                    >
                      {shipment.current_status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="bg-secondary/5 rounded-lg p-4">
                  <p className="text-sm text-foreground/60 mb-1">Current Location</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {shipment.current_location}
                  </p>
                </div>

                {shipment.estimated_delivery_date && (
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-sm text-foreground/60 mb-1">Estimated Delivery</p>
                    <p className="font-bold text-primary">
                      {new Date(shipment.estimated_delivery_date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Tracking History Timeline */}
              {trackingHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-semibold mb-4">Tracking History</h3>
                  <div className="space-y-4">
                    {trackingHistory.map((event, index) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${index === 0 ? "bg-primary" : "bg-border"}`} />
                          {index < trackingHistory.length - 1 && <div className="w-0.5 h-12 bg-border mt-1" />}
                        </div>
                        <div className="pb-4">
                          <p className="font-semibold text-foreground">{event.status.replace(/_/g, " ")}</p>
                          <p className="text-sm text-foreground/60">{event.location}</p>
                          {event.description && <p className="text-sm text-foreground/50 mt-1">{event.description}</p>}
                          <p className="text-xs text-foreground/40 mt-2">
                            {new Date(event.timestamp).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Order Items */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Order Items
            </h2>

            <div className="space-y-3">
              {order.order_items?.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center pb-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.coin?.name}</p>
                    <p className="text-sm text-foreground/60">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">₹{(item.coin?.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Delivery Address */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Delivery Address
            </h2>

            {address && (
              <div className="bg-secondary/5 rounded-lg p-4 space-y-2">
                <p className="font-semibold">{address.full_name}</p>
                <p className="text-foreground/70">
                  {address.street}
                  <br />
                  {address.city}, {address.state} {address.postal_code}
                </p>
                <p className="text-foreground/60 text-sm">{address.phone}</p>
              </div>
            )}
          </Card>

          {/* Order Summary */}
          <Card className="p-6 space-y-3">
            <h2 className="text-xl font-bold">Order Summary</h2>
            <div className="space-y-2 pb-4 border-b border-border">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">Subtotal</span>
                <span className="font-medium">
                  ₹
                  {(
                    order.order_items?.reduce(
                      (sum: number, item: any) => sum + (item.coin?.price || 0) * item.quantity,
                      0,
                    ) || 0
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">Shipping</span>
                <span className="font-medium">₹200.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">Tax (18%)</span>
                <span className="font-medium">
                  ₹
                  {(
                    ((order.order_items?.reduce(
                      (sum: number, item: any) => sum + (item.coin?.price || 0) * item.quantity,
                      0,
                    ) || 0) +
                      200) *
                    0.18
                  ).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary">₹{order.total_amount.toFixed(2)}</span>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { Package, ChevronRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Order {
  id: string
  order_number: string
  total_amount: number
  payment_status: string
  order_status: string
  created_at: string
  shipping_address_id: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchOrders() {
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
          .from("orders")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setOrders(data || [])
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

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
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/20 text-red-700"
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-primary mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-16 h-16 mx-auto text-foreground/30 mb-4" />
            <p className="text-lg text-foreground/60 mb-6">No orders yet</p>
            <Link href="/shop">
              <Button className="bg-primary hover:bg-primary/90">Start Shopping</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="p-6 hover:shadow-lg transition cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{order.order_number}</h3>
                      <div className="flex items-center gap-4 text-sm text-foreground/60 mb-3">
                        <span>
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span>₹{order.total_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(order.order_status)}`}
                        >
                          {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                        </span>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(order.payment_status)}`}
                        >
                          {order.payment_status === "completed"
                            ? "Paid"
                            : "Payment " + order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-foreground/40" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase-client"
import { isAdmin } from "@/lib/admin-check"
import { Loader2, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/footer"

interface Order {
  id: string
  order_number: string
  total_amount: number
  payment_status: string
  order_status: string
  created_at: string
  shipping_address: {
    phone: string
    full_name: string
  }
  shipment_tracking: Array<{
    tracking_number: string
    current_status: string
  }>
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [filter, setFilter] = useState("all")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const admin = await isAdmin()
      if (!admin) {
        router.push("/auth/login")
        return
      }
      setCheckingAuth(false)
      fetchOrders()
    }

    checkAuth()
  }, [filter, router])

  async function fetchOrders() {
    try {
      let query = supabase
        .from("orders")
        .select(
          `
        id,
        order_number,
        total_amount,
        payment_status,
        order_status,
        created_at,
        shipping_address:addresses(phone, full_name),
        shipment_tracking(
          tracking_number,
          current_status
        )
      `,
        )
        .order("created_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("order_status", filter)
      }

      const { data, error } = await query

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("orders").update({ order_status: newStatus }).eq("id", orderId)

      if (error) throw error
      fetchOrders()
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

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
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-700"
    }
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <Footer />
    </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-primary mb-8">Manage Orders</h1>

        {/* Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {["all", "pending", "confirmed", "shipped", "delivered"].map((status) => (
            <Button
              key={status}
              onClick={() => setFilter(status)}
              variant={filter === status ? "default" : "outline"}
              className={filter === status ? "bg-primary hover:bg-primary/90" : "bg-transparent"}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-4 px-4 font-semibold">Order ID</th>
                  <th className="text-left py-4 px-4 font-semibold">Customer</th>
                  <th className="text-left py-4 px-4 font-semibold">Phone</th>
                  <th className="text-left py-4 px-4 font-semibold">Amount</th>
                  <th className="text-left py-4 px-4 font-semibold">Status</th>
                  <th className="text-left py-4 px-4 font-semibold">Payment</th>
                  <th className="text-left py-4 px-4 font-semibold">Tracking</th>
                  <th className="text-right py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-secondary/5 transition">
                    <td className="py-4 px-4 font-mono text-sm">{order.order_number}</td>
                    <td className="py-4 px-4">{order.shipping_address?.full_name || 'N/A'}</td>
                    <td className="py-4 px-4">{order.shipping_address?.phone || 'N/A'}</td>
                    <td className="py-4 px-4">₹{order.total_amount.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <select
                        value={order.order_status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 ${getStatusColor(order.order_status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.payment_status)}`}
                      >
                        {order.payment_status === "completed" ? "Paid" : order.payment_status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-mono">
                      {order.shipment_tracking?.[0]?.tracking_number || "N/A"}
                    </td>
                    <td className="py-4 px-4 flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 bg-transparent"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-foreground/60">No orders found</p>
          </Card>
        )}
      </div>
      <Footer />
    </main>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase-client"
import { isAdmin } from "@/lib/admin-check"
import { ArrowLeft, Loader2, Package, MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [checkingAuth, setCheckingAuth] = useState(true)
    const [updating, setUpdating] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        async function checkAuthAndFetchOrder() {
            const admin = await isAdmin()
            if (!admin) {
                router.push('/auth/login')
                return
            }
            setCheckingAuth(false)

            try {
                const { data, error } = await supabase
                    .from("orders")
                    .select(`
            *,
            order_items (
              *,
              coin:coins (*)
            ),
            shipping_address:addresses (*),
            shipment_tracking (*)
          `)
                    .eq("id", params.id)
                    .single()

                if (error) throw error
                setOrder(data)
            } catch (error) {
                console.error("Error fetching order:", error)
            } finally {
                setLoading(false)
            }
        }

        checkAuthAndFetchOrder()
    }, [params.id, router])

    const updateOrderStatus = async (newStatus: string) => {
        setUpdating(true)
        try {
            const { error } = await supabase
                .from("orders")
                .update({ order_status: newStatus })
                .eq("id", params.id)

            if (error) throw error
            setOrder({ ...order, order_status: newStatus })
        } catch (error) {
            console.error("Error updating order:", error)
        } finally {
            setUpdating(false)
        }
    }

    if (checkingAuth || loading) {
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
                <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                    <p>Order not found</p>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
            <Header />

            <div className="max-w-6xl mx-auto px-4 py-12">
                <Link href="/admin/orders">
                    <Button variant="ghost" className="mb-6 flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </Button>
                </Link>

                <div className="grid gap-6">
                    {/* Order Header */}
                    <Card className="p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-primary mb-2">
                                    Order #{order.order_number}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(order.created_at), 'PPpp')}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">₹{order.total_amount.toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground">{order.payment_method}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium">Order Status</label>
                                <select
                                    value={order.order_status}
                                    onChange={(e) => updateOrderStatus(e.target.value)}
                                    disabled={updating}
                                    className="w-full mt-1 px-4 py-2 rounded-lg border border-border bg-card text-foreground"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium">Payment Status</label>
                                <p className="mt-2.5 text-sm">
                                    <span className={`px-3 py-1 rounded-full ${order.payment_status === 'completed'
                                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700'
                                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700'
                                        }`}>
                                        {order.payment_status}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Shipping Address */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Shipping Address
                            </h2>
                            {order.shipping_address ? (
                                <div className="space-y-2 text-sm">
                                    <p className="font-medium">{order.shipping_address.full_name}</p>
                                    <p className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        {order.shipping_address.phone}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {order.shipping_address.street}<br />
                                        {order.shipping_address.city}, {order.shipping_address.state}<br />
                                        {order.shipping_address.postal_code}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No address provided</p>
                            )}
                        </Card>

                        {/* Shipment Tracking */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Shipment Tracking
                            </h2>
                            {order.shipment_tracking && order.shipment_tracking.length > 0 ? (
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-medium">Tracking Number:</span> {order.shipment_tracking[0].tracking_number}</p>
                                    <p><span className="font-medium">Status:</span> {order.shipment_tracking[0].current_status}</p>
                                    {order.shipment_tracking[0].current_location && (
                                        <p><span className="font-medium">Location:</span> {order.shipment_tracking[0].current_location}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No tracking information</p>
                            )}
                        </Card>
                    </div>

                    {/* Order Items */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.order_items.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
                                    {item.coin?.image_url && (
                                        <div className="relative w-20 h-20 flex-shrink-0">
                                            <Image
                                                src={item.coin.image_url}
                                                alt={item.coin.name}
                                                fill
                                                className="object-cover rounded"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-medium">{item.coin?.name || 'Unknown Item'}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">₹{(item.quantity * item.price).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </main>
    )
}

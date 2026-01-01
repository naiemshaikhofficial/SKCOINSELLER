"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase-client"
import { isAdmin } from "@/lib/admin-check"
import { Loader2, DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from "recharts"
import { format, subDays, startOfDay } from "date-fns"
import { Footer } from "@/components/footer"

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
    })
    const [revenueData, setRevenueData] = useState<any[]>([])
    const [recentOrders, setRecentOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [checkingAuth, setCheckingAuth] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function checkAuthAndFetchData() {
            const admin = await isAdmin()
            if (!admin) {
                router.push('/auth/login')
                return
            }
            setCheckingAuth(false)
            await fetchDashboardData()
        }

        checkAuthAndFetchData()
    }, [router])

    async function fetchDashboardData() {
        try {
            // Fetch all orders
            const { data: orders, error: ordersError } = await supabase
                .from("orders")
                .select("*")
                .order("created_at", { ascending: false })

            if (ordersError) throw ordersError

            // Calculate stats
            const totalRevenue = orders
                ?.filter(o => o.payment_status === 'completed')
                .reduce((sum, order) => sum + order.total_amount, 0) || 0

            const totalOrders = orders?.length || 0
            const pendingOrders = orders?.filter(o => o.order_status === 'pending').length || 0
            const completedOrders = orders?.filter(o => o.order_status === 'delivered').length || 0

            setStats({
                totalRevenue,
                totalOrders,
                pendingOrders,
                completedOrders,
            })

            // Generate last 7 days revenue data
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = startOfDay(subDays(new Date(), 6 - i))
                const dateStr = format(date, 'yyyy-MM-dd')
                const dayOrders = orders?.filter(o =>
                    format(new Date(o.created_at), 'yyyy-MM-dd') === dateStr &&
                    o.payment_status === 'completed'
                ) || []
                const revenue = dayOrders.reduce((sum, o) => sum + o.total_amount, 0)

                return {
                    date: format(date, 'MMM dd'),
                    revenue,
                    orders: dayOrders.length,
                }
            })

            setRevenueData(last7Days)

            // Get recent 5 orders
            setRecentOrders(orders?.slice(0, 5) || [])
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
        } finally {
            setLoading(false)
        }
    }

    if (checkingAuth || loading) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
                <Header />
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <Footer />
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
            <Header />

            <div className="max-w-7xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-primary mb-8">Dashboard</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                                <p className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</p>
                            </div>
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Pending Orders</p>
                                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-yellow-500" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Completed Orders</p>
                                <p className="text-2xl font-bold">{stats.completedOrders}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Revenue Chart */}
                <Card className="p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">Revenue (Last 7 Days)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Orders Chart */}
                <Card className="p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">Orders (Last 7 Days)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="orders" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Recent Orders */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
                    <div className="space-y-3">
                        {recentOrders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary/5 transition cursor-pointer"
                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                            >
                                <div>
                                    <p className="font-medium font-mono text-sm">{order.order_number}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(order.created_at), 'PPp')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">₹{order.total_amount.toFixed(2)}</p>
                                    <p className={`text-xs px-2 py-1 rounded-full ${order.order_status === 'delivered' ? 'bg-green-100 dark:bg-green-900/20 text-green-700' :
                                        order.order_status === 'shipped' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700' :
                                            order.order_status === 'confirmed' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700' :
                                                'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700'
                                        }`}>
                                        {order.order_status}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <Footer />
        </main>
    )
}

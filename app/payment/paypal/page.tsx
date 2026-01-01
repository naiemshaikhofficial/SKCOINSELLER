"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase-client"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Footer } from "@/components/footer"

export default function PayPalPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get("orderId")
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending")
  const supabase = createClient()

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        router.push("/")
        return
      }

      try {
        const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).single()

        if (error) throw error
        setOrder(data)
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const simulatePayPalPayment = async () => {
    setPaymentProcessing(true)

    try {
      // Simulate API call to PayPal
      // In production, you would integrate actual PayPal SDK
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update order status
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "completed",
          order_status: "confirmed",
        })
        .eq("id", orderId)

      if (error) throw error

      setPaymentStatus("success")
      setOrder({ ...order, payment_status: "completed", order_status: "confirmed" })
    } catch (error) {
      console.error("Payment error:", error)
      setPaymentStatus("failed")
    } finally {
      setPaymentProcessing(false)
    }
  }

  if (loading) {
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

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="p-8 space-y-6">
          <div className="text-center">
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
              <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h10m4 0h.01M7 19h10m4 0h.01"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">PayPal Payment</h1>
            <p className="text-foreground/60">Order #{order?.order_number}</p>
          </div>

          {paymentStatus === "pending" && (
            <>
              <Card className="p-6 bg-secondary/5 space-y-4">
                <h2 className="font-semibold text-lg">Payment Details</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Order ID</span>
                    <span className="font-medium">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Amount</span>
                    <span className="font-bold text-primary text-lg">₹{order?.total_amount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Payment Method</span>
                    <span className="font-medium">PayPal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Status</span>
                    <span className="text-yellow-600 font-medium">Pending</span>
                  </div>
                </div>
              </Card>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-foreground/70">
                  Click the button below to proceed with PayPal. International payment option available.
                </p>
              </div>

              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
                onClick={simulatePayPalPayment}
                disabled={paymentProcessing}
              >
                {paymentProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {paymentProcessing ? "Processing Payment..." : "Pay with PayPal"}
              </Button>
            </>
          )}

          {paymentStatus === "success" && (
            <div className="text-center space-y-6">
              <div className="inline-block p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
                <p className="text-foreground/60">Your order has been confirmed</p>
              </div>

              <Card className="p-6 bg-secondary/5">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Order ID</span>
                    <span className="font-medium">{order?.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Total Amount</span>
                    <span className="font-bold text-lg">₹{order?.total_amount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Status</span>
                    <span className="text-green-600 font-medium">Confirmed</span>
                  </div>
                </div>
              </Card>

              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => router.push("/orders")}
              >
                View Orders
              </Button>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="text-center space-y-6">
              <div className="inline-block p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
                <p className="text-foreground/60">Your payment could not be processed</p>
              </div>

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={simulatePayPalPayment}
                  disabled={paymentProcessing}
                >
                  {paymentProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Retry Payment
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push("/cart")}
                >
                  Back to Cart
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
      <Footer />
    </main>
  )
}

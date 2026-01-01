"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { Mail, CheckCircle } from "lucide-react"

export default function ConfirmEmailPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Header />

      <div className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md p-8 space-y-6 text-center">
          <div className="inline-block p-4 bg-primary/10 rounded-full">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-primary">Check Your Email</h1>
            <p className="text-foreground/60">We've sent a confirmation link to your email address</p>
          </div>

          <div className="bg-secondary/5 rounded-lg p-4 space-y-2">
            <p className="text-sm text-foreground/70">
              Click the link in the email to verify your account and start shopping
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-foreground/60">
            <Mail className="w-4 h-4" />
            <span>Check your inbox (or spam folder)</span>
          </div>

          <Link href="/" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90">Back to Home</Button>
          </Link>
        </Card>
      </div>

      <Footer />
    </main>
  )
}

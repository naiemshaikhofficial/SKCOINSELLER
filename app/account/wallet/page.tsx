"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase-client"
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react"
import { format } from "date-fns"

export default function WalletPage() {
    const [balance, setBalance] = useState<number>(0)
    const [transactions, setTransactions] = useState<any[]>([])
    const [amount, setAmount] = useState("")
    const [loading, setLoading] = useState(true)
    const [isDepositing, setIsDepositing] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchWalletData()
    }, [])

    async function fetchWalletData() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch balance
            const { data: wallet } = await supabase
                .from("user_wallets")
                .select("balance")
                .eq("user_id", user.id)
                .single()

            if (wallet) setBalance(Number(wallet.balance))

            // Fetch transactions
            const { data: txs } = await supabase
                .from("wallet_transactions")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })

            if (txs) setTransactions(txs)
        } catch (error) {
            console.error("Error fetching wallet:", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDeposit() {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return

        setIsDepositing(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Update/Upsert wallet balance
            const newBalance = balance + Number(amount)
            const { error: walletError } = await supabase
                .from("user_wallets")
                .upsert({ user_id: user.id, balance: newBalance, updated_at: new Date() })

            if (walletError) throw walletError

            // 2. Log transaction
            const { error: txError } = await supabase
                .from("wallet_transactions")
                .insert({
                    user_id: user.id,
                    amount: Number(amount),
                    type: "deposit",
                    description: "Money added to wallet"
                })

            if (txError) throw txError

            setAmount("")
            fetchWalletData()
            alert("Amount deposited successfully!")
        } catch (error) {
            console.error("Deposit error:", error)
            alert("Failed to deposit money. Please ensure database tables are created.")
        } finally {
            setIsDepositing(false)
        }
    }

    return (
        <main className="min-h-screen flex flex-col bg-background">
            <Header />

            <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Main Wallet Card */}
                    <div className="flex-1 space-y-6">
                        <Card className="p-8 bg-primary text-primary-foreground border-none overflow-hidden relative">
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <p className="text-primary-foreground/70 text-sm font-medium mb-1">Total Balance</p>
                                    <h2 className="text-4xl font-bold">₹{balance.toLocaleString()}</h2>
                                </div>
                                <div className="bg-accent/20 p-3 rounded-2xl">
                                    <Wallet className="w-8 h-8 text-accent" />
                                </div>
                            </div>

                            {/* Decorative Circle */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-accent" />
                                Add Money to Wallet
                            </h3>
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50">₹</span>
                                    <Input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                <Button
                                    onClick={handleDeposit}
                                    disabled={isDepositing || !amount}
                                    className="bg-accent hover:bg-accent/90 text-accent-foreground min-w-[120px]"
                                >
                                    {isDepositing ? "Processing..." : "Deposit Now"}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                * Money once added can be used for bidding on your favorite coins.
                            </p>
                        </Card>
                    </div>

                    {/* Transaction History */}
                    <div className="w-full md:w-80 space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Clock className="w-5 h-5 text-accent" />
                            Recent Activity
                        </h3>

                        <div className="space-y-3">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg"></div>)
                            ) : transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <Card key={tx.id} className="p-4 flex items-center justify-between hover:border-accent/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${tx.type === 'deposit' || tx.type === 'refund'
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                {tx.type === 'deposit' || tx.type === 'refund' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold capitalize">{tx.type.replace('_', ' ')}</p>
                                                <p className="text-[10px] text-muted-foreground">{format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}</p>
                                            </div>
                                        </div>
                                        <div className={`text-sm font-bold ${tx.type === 'deposit' || tx.type === 'refund' ? 'text-green-500' : 'text-red-500'
                                            }`}>
                                            {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}₹{tx.amount}
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-8 bg-secondary/20 rounded-lg border border-dashed border-border">
                                    <p className="text-sm text-muted-foreground">No transactions found</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </main>
    )
}

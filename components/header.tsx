"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, X, LogOut, LayoutDashboard } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { isAdmin } from "@/lib/admin-check"
import { useRouter, usePathname } from "next/navigation"

interface HeaderProps {
  cartCount?: number
}

export function Header({ cartCount = 0 }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isUserAdmin, setIsUserAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        setUser(authUser)

        // Check if user is admin
        if (authUser) {
          const adminStatus = await isAdmin()
          setIsUserAdmin(adminStatus)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
  }

  const isAdminPage = pathname?.includes("/admin")
  const isAuthPage = pathname?.includes("/auth")

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-accent border-b border-border shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="animate-coin w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">₹</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-primary-foreground">SK Coin Seller</h1>
              <p className="text-xs text-primary-foreground/80">Premium Coins & Collectibles</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-primary-foreground hover:text-primary-foreground/80 transition">
              Home
            </Link>
            <Link href="/shop" className="text-primary-foreground hover:text-primary-foreground/80 transition">
              Shop
            </Link>
            {user && (
              <Link href="/orders" className="text-primary-foreground hover:text-primary-foreground/80 transition">
                Orders
              </Link>
            )}
            {isUserAdmin && (
              <Link href="/admin/dashboard" className="text-primary-foreground hover:text-primary-foreground/80 transition flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Phone Number */}
            <div className="hidden sm:block text-primary-foreground/90 text-sm font-medium">📞 +91-9876543210</div>

            {/* Cart Icon */}
            {!isAuthPage && (
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {/* Auth Buttons */}
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    {user.user_metadata?.full_name && (
                      <span className="text-sm text-primary-foreground hidden sm:inline">
                        {user.user_metadata.full_name}
                      </span>
                    )}
                    {isAdminPage && (
                      <Link href="/admin/coins">
                        <Button size="sm" variant="secondary" className="hidden sm:inline-flex">
                          Manage Coins
                        </Button>
                      </Link>
                    )}
                    <Button size="sm" variant="secondary" onClick={handleLogout} className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/auth/login">
                      <Button size="sm" variant="secondary" className="hidden sm:inline-flex">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            <button className="md:hidden text-primary-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-slide-in">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start text-primary-foreground">
                Home
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="ghost" className="w-full justify-start text-primary-foreground">
                Shop
              </Button>
            </Link>
            {user && (
              <Link href="/orders">
                <Button variant="ghost" className="w-full justify-start text-primary-foreground">
                  Orders
                </Button>
              </Link>
            )}
            {isUserAdmin && (
              <Link href="/admin/dashboard">
                <Button variant="ghost" className="w-full justify-start text-primary-foreground flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Dashboard
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

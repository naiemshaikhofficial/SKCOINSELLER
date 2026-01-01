"use client"

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CoinButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'gold' | 'silver' | 'bronze' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    children: React.ReactNode
}

export const CoinButton = forwardRef<HTMLButtonElement, CoinButtonProps>(
    ({ className, variant = 'gold', size = 'md', loading, disabled, children, ...props }, ref) => {
        const baseStyles = "relative overflow-hidden font-semibold rounded-lg transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"

        const variantStyles = {
            gold: "bg-gold-gradient text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 glow-gold-hover",
            silver: "bg-silver-gradient text-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
            bronze: "bg-bronze-gradient text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
            outline: "border-2 border-current bg-transparent hover:bg-gradient-to-r hover:from-yellow-50 hover:to-yellow-100 dark:hover:from-yellow-900/20 dark:hover:to-yellow-800/20"
        }

        const sizeStyles = {
            sm: "px-4 py-2 text-sm",
            md: "px-6 py-3 text-base",
            lg: "px-8 py-4 text-lg"
        }

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variantStyles[variant],
                    sizeStyles[size],
                    "group",
                    className
                )}
                disabled={disabled || loading}
                {...props}
            >
                {/* Ripple Effect */}
                <span className="absolute inset-0 overflow-hidden">
                    <span className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity duration-300 rounded-full scale-0 group-active:scale-100 group-active:animate-ripple" />
                </span>

                {/* Shimmer Effect */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                {/* Content */}
                <span className="relative flex items-center justify-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {children}
                </span>
            </button>
        )
    }
)

CoinButton.displayName = 'CoinButton'

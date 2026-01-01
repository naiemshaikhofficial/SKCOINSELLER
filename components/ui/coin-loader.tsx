"use client"

import { useEffect, useState } from 'react'

interface CoinLoaderProps {
    size?: 'sm' | 'md' | 'lg'
    variant?: 'gold' | 'silver' | 'bronze'
}

export function CoinLoader({ size = 'md', variant = 'gold' }: CoinLoaderProps) {
    const [rotation, setRotation] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(prev => (prev + 10) % 360)
        }, 30)
        return () => clearInterval(interval)
    }, [])

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-16 h-16',
        lg: 'w-24 h-24'
    }

    const variantColors = {
        gold: 'from-yellow-400 via-yellow-200 to-yellow-600',
        silver: 'from-gray-300 via-white to-gray-400',
        bronze: 'from-orange-400 via-orange-200 to-orange-600'
    }

    return (
        <div className="flex items-center justify-center">
            <div
                className={`${sizeClasses[size]} rounded-full relative`}
                style={{
                    transform: `rotateY(${rotation}deg)`,
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.03s linear'
                }}
            >
                {/* Coin Face */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${variantColors[variant]} shadow-2xl flex items-center justify-center border-4 border-white/30`}>
                    <span className="text-2xl font-bold text-white" style={{ transform: `rotateY(${-rotation}deg)` }}>
                        ₹
                    </span>
                </div>

                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${variantColors[variant]} blur-md opacity-50 animate-pulse`} />
            </div>
        </div>
    )
}

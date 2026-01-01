"use client"

import { useEffect, useState } from "react"

interface CountdownTimerProps {
    endTime: string
    onEnd?: () => void
}

export function CountdownTimer({ endTime, onEnd }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number
        hours: number
        minutes: number
        seconds: number
    } | null>(null)

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime()
            const end = new Date(endTime).getTime()
            const distance = end - now

            if (distance < 0) {
                clearInterval(timer)
                setTimeLeft(null)
                if (onEnd) onEnd()
                return
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [endTime])

    if (!timeLeft) {
        return <span className="text-destructive font-bold">Ended</span>
    }

    return (
        <div className="flex gap-2 text-center">
            {timeLeft.days > 0 && (
                <div className="flex flex-col">
                    <span className="text-lg font-bold">{timeLeft.days}</span>
                    <span className="text-[10px] uppercase opacity-60">Days</span>
                </div>
            )}
            <div className="flex flex-col">
                <span className="text-lg font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className="text-[10px] uppercase opacity-60">Hrs</span>
            </div>
            <span className="text-xl font-bold self-center -mt-4">:</span>
            <div className="flex flex-col">
                <span className="text-lg font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className="text-[10px] uppercase opacity-60">Min</span>
            </div>
            <span className="text-xl font-bold self-center -mt-4">:</span>
            <div className="flex flex-col">
                <span className="text-lg font-bold text-accent">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                <span className="text-[10px] uppercase opacity-60">Sec</span>
            </div>
        </div>
    )
}

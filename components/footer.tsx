import Link from "next/link"
import { Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-accent border-t border-accent-foreground/10 mt-auto text-accent-foreground">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="relative w-10 h-10 animate-float hover:animate-coin-toss cursor-pointer transition-all">
                                <img
                                    src="/skoins-logo.png"
                                    alt="Skoins Logo"
                                    className="w-full h-full object-contain brightness-0 invert"
                                />
                            </div>
                            <h3 className="text-xl font-bold">Skoins</h3>
                        </div>
                        <p className="text-sm opacity-80">
                            Your trusted destination for premium coins, rare collectibles, and investment-grade precious metals.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-70 transition"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-70 transition"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-70 transition"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/shop" className="hover:underline transition">
                                    Shop All Coins
                                </Link>
                            </li>
                            <li>
                                <Link href="/auctions" className="hover:underline transition font-bold">
                                    Active Auctions
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:underline transition">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:underline transition">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-semibold mb-4">Contact</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>+91-9876543210</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <a href="mailto:info@skoins.com" className="hover:underline transition">
                                    info@skoins.com
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Policies */}
                    <div>
                        <h3 className="font-semibold mb-4">Policies</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/privacy" className="hover:underline transition">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:underline transition">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/refund" className="hover:underline transition">
                                    Refund Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="border-t border-accent-foreground/20 pt-6 mb-6">
                    <p className="text-sm font-medium mb-2">We Accept</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                        <span className="px-3 py-1 bg-accent-foreground/10 rounded-md">PhonePe</span>
                        <span className="px-3 py-1 bg-accent-foreground/10 rounded-md">Razorpay</span>
                        <span className="px-3 py-1 bg-accent-foreground/10 rounded-md">PayPal</span>
                        <span className="px-3 py-1 bg-accent-foreground/10 rounded-md">UPI</span>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-accent-foreground/20 pt-6 text-center">
                    <p className="text-sm opacity-80">
                        &copy; {new Date().getFullYear()} Skoins. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

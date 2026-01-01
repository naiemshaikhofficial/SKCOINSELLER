import Link from "next/link"
import { Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-secondary/50 border-t border-border mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="relative w-10 h-10 animate-float hover:animate-coin-toss cursor-pointer transition-all">
                                <img
                                    src="/skoins-logo.png"
                                    alt="Skoins Logo"
                                    className="w-full h-full object-contain drop-shadow-lg"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Skoins</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Your trusted destination for premium coins, rare collectibles, and investment-grade precious metals.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/shop" className="text-muted-foreground hover:text-primary transition">
                                    Shop All Coins
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-primary transition">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-muted-foreground hover:text-primary transition">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-muted-foreground hover:text-primary transition">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Contact</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="w-4 h-4 text-primary" />
                                <span>+91-9876543210</span>
                            </li>
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="w-4 h-4 text-primary" />
                                <a href="mailto:info@skoins.com" className="hover:text-primary transition">
                                    info@skoins.com
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Policies */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Policies</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-muted-foreground hover:text-primary transition">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/refund" className="text-muted-foreground hover:text-primary transition">
                                    Refund Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/shipping" className="text-muted-foreground hover:text-primary transition">
                                    Shipping Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="border-t border-border pt-6 mb-6">
                    <p className="text-sm text-muted-foreground mb-2">We Accept</p>
                    <div className="flex flex-wrap gap-3 text-sm text-foreground">
                        <span className="px-3 py-1 bg-card border border-border rounded-md">PhonePe</span>
                        <span className="px-3 py-1 bg-card border border-border rounded-md">Razorpay</span>
                        <span className="px-3 py-1 bg-card border border-border rounded-md">PayPal</span>
                        <span className="px-3 py-1 bg-card border border-border rounded-md">UPI</span>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-border pt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Skoins. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

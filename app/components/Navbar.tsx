"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Pill, ShoppingCart, User, LogOut } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"
import { useCart } from "../context/CartContext"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { data: session, status } = useSession()
  const { totalItems } = useCart()
  const pathname = usePathname()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-4"
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Pill className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground">
            PharmaCorp
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors relative group",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                {link.name}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left dark:opacity-0" />
              </Link>
            )
          })}
          
          {/* Cart Icon */}
          <Link href="/cart" className="relative p-2 hover:bg-accent rounded-lg transition-colors">
            <ShoppingCart className="w-5 h-5 text-muted-foreground" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {/* Auth Section */}
          {status === "loading" ? (
            <div className="w-20 h-10 bg-muted animate-pulse rounded-full" />
          ) : session?.user ? (
            <div className="flex items-center gap-2">
              <Link 
                href="/orders" 
                className={cn(
                  "text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-accent",
                  pathname.startsWith("/orders") ? "text-primary bg-accent" : "text-muted-foreground"
                )}
              >
                My Orders
              </Link>
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-full max-w-[150px]">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate">{session.user.name || session.user.email?.split("@")[0]}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Right Section */}
        <div className="flex md:hidden items-center gap-2">
          {/* Cart Icon Mobile */}
          <Link href="/cart" className="relative p-2 hover:bg-accent rounded-lg transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md overflow-hidden"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              
              {session?.user ? (
                <>
                  <Link
                    href="/orders"
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    My Orders
                  </Link>
                  <div className="flex items-center gap-2 py-2 text-muted-foreground">
                    <User className="w-5 h-5" />
                    <span>{session.user.name || session.user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      handleSignOut()
                    }}
                    className="w-full text-left text-red-500 font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-5 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}


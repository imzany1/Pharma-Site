"use client"

import { motion } from "framer-motion"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useCart } from "../context/CartContext"
import { getCartProducts } from "../actions/cart"
import { processCheckout } from "../actions/checkout"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { Product } from "@/lib/products"

// Extended type to include both stock and cart quantities
interface CartProductItem extends Omit<Product, 'quantity'> {
  stockQuantity: number  // Available in database
  cartQuantity: number   // In user's cart
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, isLoading } = useCart()
  const { data: session } = useSession()
  const router = useRouter()
  const [cartProducts, setCartProducts] = useState<CartProductItem[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [stockWarnings, setStockWarnings] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchCartProducts() {
      if (items.length === 0) {
        setCartProducts([])
        setLoadingProducts(false)
        return
      }

      try {
        const productIds = items.map(item => item.productId)
        const products = await getCartProducts(productIds)
        
        const merged: CartProductItem[] = products.map(product => {
          const cartItem = items.find(item => item.productId === product.id)
          return {
            ...product,
            stockQuantity: product.quantity ?? 0,  // Database stock
            cartQuantity: cartItem?.quantity || 0   // Cart amount
          }
        })
        
        setCartProducts(merged)
        
        // Check for stock issues
        const warnings: Record<string, string> = {}
        merged.forEach(item => {
          if (item.cartQuantity > item.stockQuantity) {
            warnings[item.id] = `Only ${item.stockQuantity} available. Please reduce quantity.`
          }
        })
        setStockWarnings(warnings)
      } catch (error) {
        console.error("Failed to load cart products", error)
      } finally {
        setLoadingProducts(false)
      }
    }

    if (!isLoading) {
      fetchCartProducts()
    }
  }, [items, isLoading])

  // Auto-redirect effect
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (showSuccess) {
      timeout = setTimeout(() => {
        finishCheckout()
      }, 5000)
    }
    return () => clearTimeout(timeout)
  }, [showSuccess])

  const handleIncrease = (item: CartProductItem) => {
    if (item.cartQuantity >= item.stockQuantity) {
      setStockWarnings(prev => ({
        ...prev,
        [item.id]: `Maximum stock reached (${item.stockQuantity} available)`
      }))
      setTimeout(() => {
        setStockWarnings(prev => {
          const next = { ...prev }
          delete next[item.id]
          return next
        })
      }, 3000)
      return
    }
    updateQuantity(item.id, item.cartQuantity + 1)
  }

  const handleCheckout = async () => {
    if (!session?.user) {
      router.push("/login?callbackUrl=/cart")
      return
    }
    
    // Check for any stock issues before checkout
    const hasStockIssues = cartProducts.some(item => item.cartQuantity > item.stockQuantity)
    if (hasStockIssues) {
      alert("Please adjust quantities for items with insufficient stock before checking out.")
      return
    }
    
    setIsCheckingOut(true)

    try {
      const checkoutItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))

      const result = await processCheckout(checkoutItems)

      if (result.success) {
        setShowSuccess(true)
        clearCart()
      } else {
        alert(result.error || "Checkout failed")
      }
    } catch {
      alert("Something went wrong during checkout")
    } finally {
      setIsCheckingOut(false)
    }
  }

  const finishCheckout = () => {
    setShowSuccess(false)
    router.push("/products")
    router.refresh()
  }

  const subtotal = cartProducts.reduce(
    (sum, item) => sum + (item.price || 0) * item.cartQuantity,
    0
  )
  
  const hasStockIssues = cartProducts.some(item => item.cartQuantity > item.stockQuantity)

  if (isLoading || loadingProducts) {
    return (
      <div className="container px-6 py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  // Success Modal
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-200 dark:border-gray-800"
        >
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Order Successful!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Thank you for your purchase. Redirecting you to products in 5 seconds...
          </p>
          <button
            onClick={finishCheckout}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Okay
          </button>
        </motion.div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto space-y-6"
        >
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
          <p className="text-muted-foreground">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartProducts.map((item, idx) => {
            const isOverStock = item.cartQuantity > item.stockQuantity
            const isAtMaxStock = item.cartQuantity >= item.stockQuantity
            const warning = stockWarnings[item.id]
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex flex-col gap-3 p-4 bg-card border rounded-xl ${
                  isOverStock ? 'border-red-300 dark:border-red-800' : 'border-border'
                }`}
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center text-3xl shrink-0 overflow-hidden relative">
                    {item.image && item.image !== "" ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                          e.currentTarget.nextElementSibling?.classList.remove("hidden")
                        }}
                      />
                    ) : null}
                    <span className={`${item.image ? "hidden" : ""} absolute inset-0 flex items-center justify-center text-3xl`}>💊</span>
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold truncate">{item.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{item.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-primary font-bold">${item.price.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.stockQuantity > 5 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : item.stockQuantity > 0
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {item.stockQuantity > 0 ? `${item.stockQuantity} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                      className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className={`w-8 text-center font-medium ${isOverStock ? 'text-red-500' : ''}`}>
                      {item.cartQuantity}
                    </span>
                    <button
                      onClick={() => handleIncrease(item)}
                      disabled={isAtMaxStock}
                      className={`p-2 rounded-lg transition-colors ${
                        isAtMaxStock 
                          ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' 
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Stock Warning */}
                {(warning || isOverStock) && (
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{warning || `Only ${item.stockQuantity} available. Please reduce quantity.`}</span>
                  </div>
                )}
              </motion.div>
            )
          })}

          <button
            onClick={clearCart}
            className="text-red-500 text-sm font-medium hover:underline"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${subtotal.toFixed(2)}</span>
              </div>
            </div>

            {hasStockIssues && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Some items exceed available stock. Please adjust quantities.</span>
              </div>
            )}

            <button 
              onClick={handleCheckout}
              disabled={isCheckingOut || cartProducts.length === 0 || hasStockIssues}
              className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCheckingOut ? (
                <>Processing...</>
              ) : (
                <>Proceed to Checkout</>
              )}
            </button>
            
            <Link
              href="/products"
              className="block text-center text-primary font-medium mt-4 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


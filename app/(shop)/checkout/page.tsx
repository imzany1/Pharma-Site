"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, CheckCircle, Package, MapPin, CreditCard, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCart } from "@/app/context/CartContext"
import { getCartProducts } from "@/app/actions/cart"
import type { Product } from "@/lib/repositories"

interface ShippingData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  notes: string
}

const STEPS = [
  { id: 1, name: "Review", icon: Package },
  { id: 2, name: "Shipping", icon: MapPin },
  { id: 3, name: "Payment", icon: CreditCard },
]

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { items, clearCart, isLoading: cartLoading } = useCart()
  
  const [step, setStep] = useState(1)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  
  const [shipping, setShipping] = useState<ShippingData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: ""
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout")
    }
  }, [status, router])

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      router.push("/cart")
    }
  }, [cartLoading, items, router])

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      if (items.length === 0) return
      try {
        const productIds = items.map(item => item.productId)
        const data = await getCartProducts(productIds)
        setProducts(data)
      } catch (err) {
        console.error("Failed to fetch products", err)
      } finally {
        setLoading(false)
      }
    }
    
    if (!cartLoading) {
      fetchProducts()
    }
  }, [items, cartLoading])

  // Pre-fill email from session
  useEffect(() => {
    if (session?.user?.email) {
      setShipping(prev => ({ ...prev, email: session.user?.email || "" }))
    }
    if (session?.user?.name) {
      setShipping(prev => ({ ...prev, name: session.user?.name || "" }))
    }
  }, [session])

  const getProductQuantity = (productId: string) => {
    return items.find(item => item.productId === productId)?.quantity || 0
  }

  const subtotal = products.reduce((sum, product) => {
    const qty = getProductQuantity(product.id)
    return sum + (product.price * qty)
  }, 0)

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShipping(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const validateShipping = () => {
    const required = ["name", "email", "phone", "address", "city", "state", "zip"]
    for (const field of required) {
      if (!shipping[field as keyof ShippingData]?.trim()) {
        setError(`Please fill in ${field}`)
        return false
      }
    }
    
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(shipping.email)) {
      setError("Please enter a valid email address")
      return false
    }
    
    // Basic phone validation (10 digits)
    if (!/^\d{10}$/.test(shipping.phone.replace(/\D/g, ''))) {
      setError("Please enter a valid 10-digit phone number")
      return false
    }
    
    setError("")
    return true
  }

  const handleNextStep = () => {
    if (step === 2 && !validateShipping()) return
    setStep(prev => Math.min(prev + 1, 3))
  }

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handlePlaceOrder = async () => {
    if (!validateShipping()) {
      setStep(2)
      return
    }

    setSubmitting(true)
    setError("")

    try {
      // Prepare order data
      const orderItems = products.map(product => ({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        productPrice: product.price,
        quantity: getProductQuantity(product.id)
      }))

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          shipping: {
            name: shipping.name,
            email: shipping.email,
            phone: shipping.phone,
            address: shipping.address,
            city: shipping.city,
            state: shipping.state,
            zip: shipping.zip
          },
          notes: shipping.notes
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Checkout failed")
      }

      // Clear cart and redirect to confirmation
      clearCart()
      router.push(`/orders/${result.orderId}/confirmation`)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (status === "loading" || loading || cartLoading) {
    return (
      <div className="container px-6 py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="container px-6 py-12 max-w-4xl mx-auto">
      <Link href="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </Link>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-12">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center">
            <div 
              className={`flex items-center gap-2 ${
                step >= s.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step > s.id 
                  ? "bg-primary border-primary text-white"
                  : step === s.id 
                    ? "border-primary text-primary"
                    : "border-muted-foreground"
              }`}>
                {step > s.id ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <s.icon className="w-5 h-5" />
                )}
              </div>
              <span className="hidden sm:inline font-medium">{s.name}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mx-2 sm:mx-4 ${
                step > s.id ? "bg-primary" : "bg-muted"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Step 1: Review Order */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold mb-4">Review Your Order</h2>
                <div className="space-y-4">
                  {products.map(product => {
                    const qty = getProductQuantity(product.id)
                    return (
                      <div key={product.id} className="flex gap-4 py-3 border-b border-border last:border-0">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">💊</span>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">Qty: {qty}</p>
                        </div>
                        <p className="font-bold">₹{(product.price * qty).toFixed(2)}</p>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Shipping Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold mb-4">Shipping Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={shipping.name}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={shipping.email}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shipping.phone}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={shipping.address}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Street address, apartment, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={shipping.city}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={shipping.state}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">PIN Code *</label>
                    <input
                      type="text"
                      name="zip"
                      value={shipping.zip}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="6-digit PIN code"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">Order Notes (optional)</label>
                    <textarea
                      name="notes"
                      value={shipping.notes}
                      onChange={handleShippingChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                <div className="p-4 border-2 border-primary rounded-xl bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="font-bold">Cash on Delivery (COD)</p>
                      <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    💡 Online payment options coming soon! For now, please pay cash on delivery.
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-bold mb-3">Shipping to:</h3>
                  <p className="text-muted-foreground">
                    {shipping.name}<br />
                    {shipping.address}<br />
                    {shipping.city}, {shipping.state} - {shipping.zip}<br />
                    Phone: {shipping.phone}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrevStep}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            
            {step < 3 ? (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6 text-sm">
              {products.map(product => (
                <div key={product.id} className="flex justify-between">
                  <span className="text-muted-foreground truncate max-w-[60%]">
                    {product.name} × {getProductQuantity(product.id)}
                  </span>
                  <span>₹{(product.price * getProductQuantity(product.id)).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

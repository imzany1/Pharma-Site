"use client"

import { Product } from "@/lib/products"
import { useCart } from "@/app/context/CartContext"
import { useState } from "react"
import { ShoppingCart, Minus, Plus, AlertCircle } from "lucide-react"

export function ProductDetailsClient({ product }: { product: Product }) {
  const { addItem, items } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  // Calculate actual stock available considering what's already in the cart
  const cartItem = items.find(item => item.productId === product.id)
  const cartQuantity = cartItem ? cartItem.quantity : 0
  const stockAvailable = (product.quantity || 0) - cartQuantity
  const isOutOfStock = stockAvailable <= 0
  
  const handleAddToCart = async () => {
    if (isOutOfStock) return

    setIsAdding(true)
    // Simulate network delay for better UX feel
    await new Promise(resolve => setTimeout(resolve, 500))
    
    addItem(product.id, quantity)
    
    setIsAdding(false)
    setQuantity(1) // Reset quantity after adding
    alert("Added to cart!") // Replace with better toast if available
  }

  const handleIncrement = () => {
    if (quantity < stockAvailable) {
      setQuantity(q => q + 1)
    }
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
            {product.category}
          </span>
          {stockAvailable <= 5 && stockAvailable > 0 && (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              Only {stockAvailable} left
            </span>
          )}
        </div>
      </div>

      <div className="text-3xl font-bold text-primary">
        ${product.price.toFixed(2)}
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          {product.description}
        </p>
      </div>

      <div className="border-t border-b border-gray-200 dark:border-gray-800 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900 dark:text-white">Availability:</span>
          {isOutOfStock ? (
            <span className="text-red-600 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              Out of Stock
            </span>
          ) : (
            <span className="text-emerald-600 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              In Stock ({stockAvailable} available)
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900 dark:text-white">Quantity:</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1 || isOutOfStock}
              className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium text-lg">{quantity}</span>
            <button
              onClick={handleIncrement}
              disabled={quantity >= stockAvailable || isOutOfStock}
              className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isAdding}
        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all ${
          isOutOfStock
            ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98]"
        }`}
      >
        <ShoppingCart className="w-6 h-6" />
        {isAdding ? "Adding..." : isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </button>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
          <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">Secure Delivery</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Fast shipping worldwide</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
          <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">Quality Guarantee</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Certified pharmaceutical grade</p>
        </div>
      </div>
    </div>
  )
}

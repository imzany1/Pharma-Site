"use client"

import { motion } from "framer-motion"
import { ShoppingCart, AlertCircle } from "lucide-react"
import { useCart } from "../context/CartContext"
import type { Product } from "@/lib/products"
import { useState } from "react"

interface ProductsGridProps {
  products: Product[]
}

export function ProductsGrid({ products }: ProductsGridProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product, idx) => (
        <ProductCard key={product.id} product={product} index={idx} />
      ))}
    </div>
  )
}

function ProductCard({ product, index }: { product: Product, index: number }) {
  const { addItem, items, removeItem, updateQuantity } = useCart()
  const [showStockWarning, setShowStockWarning] = useState(false)

  const cartItem = items.find(item => item.productId === product.id)
  const cartQuantity = cartItem?.quantity || 0
  
  // Stock is determined by quantity, not the inStock boolean
  const stockAvailable = product.quantity ?? 0
  const isOutOfStock = stockAvailable <= 0
  const remainingStock = stockAvailable - cartQuantity
  const canAddMore = remainingStock > 0

  const handleAddToCart = () => {
    if (!canAddMore) {
      setShowStockWarning(true)
      setTimeout(() => setShowStockWarning(false), 3000)
      return
    }
    addItem(product.id)
  }

  const handleIncrease = () => {
    if (!canAddMore) {
      setShowStockWarning(true)
      setTimeout(() => setShowStockWarning(false), 3000)
      return
    }
    updateQuantity(product.id, cartQuantity + 1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
    >
      {/* Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative overflow-hidden">
        <div className="text-6xl opacity-50">💊</div>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">Out of Stock</span>
          </div>
        )}
        <span className="absolute top-3 left-3 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
          {product.category}
        </span>
        {/* Stock indicator */}
        {!isOutOfStock && (
          <span className={`absolute top-3 right-3 text-xs font-medium px-3 py-1 rounded-full ${
            stockAvailable <= 5 
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' 
              : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
          }`}>
            {stockAvailable <= 5 ? `Only ${stockAvailable} left` : `${stockAvailable} in stock`}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{product.name}</h3>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{product.description}</p>
        </div>

        {/* Stock Warning */}
        {showStockWarning && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Maximum stock reached ({stockAvailable} available)</span>
          </motion.div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
          
          {cartQuantity > 0 ? (
            <div className="flex items-center gap-2">
               <button
                onClick={() => updateQuantity(product.id, cartQuantity - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-6 text-center font-medium">{cartQuantity}</span>
              <button
                onClick={handleIncrease}
                disabled={!canAddMore}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                  canAddMore 
                    ? 'bg-muted hover:bg-muted/80' 
                    : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                }`}
                aria-label="Increase quantity"
              >
                +
              </button>
              <button
                onClick={() => removeItem(product.id)}
                className="ml-2 text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                !isOutOfStock
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-4 h-4" /> Add
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}


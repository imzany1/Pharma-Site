"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, AlertCircle, Search, X } from "lucide-react"
import { useCart } from "../../context/CartContext"
import type { Product } from "@/lib/products"
import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"

interface ProductsGridProps {
  products: Product[]
}

export function ProductsGrid({ products }: ProductsGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  
  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category))
    return ["All", ...Array.from(cats)].sort()
  }, [products])

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])

  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 rounded-full border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-center text-muted-foreground text-sm">
        Showing {filteredProducts.length} results
      </div>

      {/* Grid */}
      <motion.div 
        className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>

      {filteredProducts.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
          <button 
            onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
            className="mt-4 text-primary font-medium hover:underline"
          >
            Clear all filters
          </button>
        </motion.div>
      )}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const { addItem, items, removeItem, updateQuantity } = useCart()
  const [showStockWarning, setShowStockWarning] = useState(false)
  const [imageError, setImageError] = useState(false)

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
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full flex flex-col"
    >
      {/* Image - Clickable */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="h-48 bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center relative overflow-hidden cursor-pointer">
          {product.image && !imageError ? (
             <Image
              src={product.image}
              alt={product.name}
              width={200}
              height={200}
              className="object-contain w-full h-full p-4 group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
             <div className="text-6xl opacity-50 transition-transform duration-300 group-hover:scale-110">💊</div>
          )}
         
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">Out of Stock</span>
            </div>
          )}
          <span className="absolute top-3 left-3 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
            {product.category}
          </span>
          {/* Stock indicator */}
          {!isOutOfStock && (
            <span className={`absolute top-3 right-3 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm ${
              stockAvailable <= 5 
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' 
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
            }`}>
              {stockAvailable <= 5 ? `Only ${stockAvailable} left` : `${stockAvailable} in stock`}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 space-y-4 flex flex-col flex-grow">
        <Link href={`/products/${product.id}`} className="block flex-grow">
          <div>
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{product.name}</h3>
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{product.description}</p>
          </div>
        </Link>
        
        {/* Stock Warning */}
        <AnimatePresence>
          {showStockWarning && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg overflow-hidden"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">Max stock reached</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mt-auto pt-2">
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
                className="ml-2 text-red-500 hover:text-red-700 transition-colors p-1"
                aria-label="Remove item"
              >
                <X className="w-4 h-4" />
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

"use client"

import { motion } from "framer-motion"
import { ShoppingCart, Check } from "lucide-react"
import { products } from "@/lib/products"
import { useCart } from "../context/CartContext"
import { useState } from "react"

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Products</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our range of premium pharmaceutical products designed for your health and wellness.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </section>
    </div>
  )
}

function ProductCard({ product, index }: { product: typeof products[0], index: number }) {
  const { addItem, items, removeItem, updateQuantity } = useCart()
  const [isHovered, setIsHovered] = useState(false)

  const cartItem = items.find(item => item.productId === product.id)
  const quantity = cartItem?.quantity || 0

  const handleAddToCart = () => {
    addItem(product.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative overflow-hidden">
        <div className="text-6xl opacity-50">💊</div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">Out of Stock</span>
          </div>
        )}
        <span className="absolute top-3 left-3 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
          {product.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{product.name}</h3>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
          
          {quantity > 0 ? (
            <div className="flex items-center gap-2">
               <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-6 text-center font-medium">{quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors"
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
              disabled={!product.inStock}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                product.inStock
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

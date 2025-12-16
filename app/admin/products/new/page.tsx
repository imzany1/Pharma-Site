"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Package } from "lucide-react"

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"),
      category: formData.get("category"),
      image: formData.get("image") || "/products/default.jpg",
      inStock: formData.get("inStock") === "on",
      quantity: formData.get("quantity")
    }

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        router.push("/admin/products")
        router.refresh()
      } else {
        const result = await response.json()
        setError(result.error || "Failed to create product")
      }
    } catch {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link 
          href="/admin/products"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Product</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            placeholder="e.g., CardioGuard Plus"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
            placeholder="Describe the product..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Price ($) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="49.99"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Stock Quantity *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              required
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="100"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          >
            <option value="">Select a category</option>
            <option value="Heart Health">Heart Health</option>
            <option value="Immunity">Immunity</option>
            <option value="Mental Wellness">Mental Wellness</option>
            <option value="Joint Health">Joint Health</option>
            <option value="Digestive Health">Digestive Health</option>
            <option value="General Wellness">General Wellness</option>
            <option value="Sleep Support">Sleep Support</option>
            <option value="Energy">Energy</option>
          </select>
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Image URL
          </label>
          <input
            type="text"
            id="image"
            name="image"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            placeholder="/products/product-image.jpg"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="inStock"
            name="inStock"
            defaultChecked
            className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
          />
          <label htmlFor="inStock" className="text-sm font-medium text-gray-900 dark:text-white">
            In Stock
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create Product
              </>
            )}
          </button>
          <Link
            href="/admin/products"
            className="px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

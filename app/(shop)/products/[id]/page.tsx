import { getProductById } from "@/lib/products"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ProductDetailsClient } from "./ProductDetailsClient"

// Enable ISR: Revalidate this page every hour
export const revalidate = 3600

export default async function ProductPage({ params }: { params: { id: string } }) {
  // Await params first (Next.js 15+ requirement, good practice generally)
  const { id } = await params
  
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <Link 
        href="/products" 
        className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        {/* Product Image Section */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
            {/* Main Image */}
            <div className="absolute inset-0 p-8 flex items-center justify-center">
               <Image
                src={product.image}
                alt={product.name}
                width={800}
                height={800}
                className="object-contain w-full h-full hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>
            {/* Floating Stock Badge for styling */}
            {(product.quantity || 0) > 0 && (product.quantity || 0) <= 5 && (
              <div className="absolute top-4 right-4 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-sm font-medium border border-amber-200 dark:border-amber-800 backdrop-blur-sm">
                Low Stock
              </div>
            )}
          </div>
        </div>

        {/* Product Details Section */}
        <div>
          <ProductDetailsClient product={product} />
        </div>
      </div>
    </div>
  )
}

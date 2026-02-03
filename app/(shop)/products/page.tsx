import { getAllProducts } from "@/lib/products"
import { ProductsGrid } from "./ProductsGrid"

// Make this page dynamic to avoid build-time database requirement
// This allows the application to build without DATABASE_URL configured
// Trade-off: Each request will fetch fresh data from the database (no caching)
// For better performance with caching, configure DATABASE_URL at build time and use ISR
export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const products = await getAllProducts()

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
        <ProductsGrid products={products} />
      </section>
    </div>
  )
}


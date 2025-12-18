import { productRepository } from "@/lib/repositories"
import { Package, AlertTriangle, DollarSign, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboard() {
  // Get dashboard stats
  const inventoryStats = await productRepository.getInventoryStats()

  const stats = [
    {
      title: "Total Products",
      value: inventoryStats.totalProducts,
      icon: Package,
      color: "bg-blue-500",
      href: "/admin/products"
    },
    {
      title: "Low Stock",
      value: inventoryStats.lowStockCount,
      icon: AlertTriangle,
      color: "bg-amber-500",
      href: "/admin/products?filter=low-stock"
    },
    {
      title: "Out of Stock",
      value: inventoryStats.outOfStockCount,
      icon: TrendingUp,
      color: "bg-red-500",
      href: "/admin/products?filter=out-of-stock"
    },
    {
      title: "Inventory Value",
      value: `$${inventoryStats.totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-emerald-500",
      href: "/admin/products"
    }
  ]

  // Get recent products
  const recentProducts = await productRepository.findRecent(5)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome to the admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link 
            key={stat.title} 
            href={stat.href}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-xl text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              href="/admin/products/new"
              className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
            >
              <Package className="w-5 h-5" />
              Add New Product
            </Link>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Products</h2>
          {recentProducts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No products yet</p>
          ) : (
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}/edit`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">${product.price}</p>
                    <p className={`text-sm ${product.quantity > 10 ? 'text-emerald-500' : product.quantity > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                      {product.quantity} in stock
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

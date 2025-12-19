import { productRepository, orderRepository } from "@/lib/repositories"
import { Package, AlertTriangle, DollarSign, TrendingUp, ShoppingBag, Clock } from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  CONFIRMED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  PROCESSING: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  SHIPPED: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
  DELIVERED: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
}

export default async function AdminDashboard() {
  // Get dashboard stats
  const [inventoryStats, orderStats, recentProducts, recentOrders] = await Promise.all([
    productRepository.getInventoryStats(),
    orderRepository.getOrderStats(),
    productRepository.findRecent(5),
    orderRepository.getRecentOrders(5)
  ])

  const stats = [
    {
      title: "Total Orders",
      value: orderStats.totalOrders,
      icon: ShoppingBag,
      color: "bg-blue-500",
      href: "/admin/orders"
    },
    {
      title: "Pending Orders",
      value: orderStats.pendingOrders,
      icon: Clock,
      color: "bg-amber-500",
      href: "/admin/orders"
    },
    {
      title: "Today's Revenue",
      value: `$${orderStats.todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-emerald-500",
      href: "/admin/orders"
    },
    {
      title: "Total Revenue",
      value: `$${orderStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "bg-purple-500",
      href: "/admin/orders"
    }
  ]

  const inventoryWidgets = [
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
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome to the admin panel</p>
      </div>

      {/* Order Stats Grid */}
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

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {inventoryWidgets.map((stat) => (
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

      {/* Quick Actions and Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.shippingName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">${order.total.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Products */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Products</h2>
            <Link href="/admin/products" className="text-sm text-primary hover:underline">View all</Link>
          </div>
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

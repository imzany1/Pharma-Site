import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { orderRepository } from "@/lib/repositories"
import Link from "next/link"
import { Package, ArrowRight, ShoppingBag } from "lucide-react"

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  CONFIRMED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  PROCESSING: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  SHIPPED: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
  DELIVERED: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
}

export default async function OrdersPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/orders")
  }

  const orders = await orderRepository.findByUser(session.user.id)

  if (orders.length === 0) {
    return (
      <div className="container px-6 py-20">
        <div className="text-center max-w-md mx-auto space-y-6">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">No Orders Yet</h1>
          <p className="text-muted-foreground">
            You haven&apos;t placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 sm:px-6 py-8 sm:py-12 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block bg-card border border-border rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <p className="font-bold text-base sm:text-lg">{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium ${statusColors[order.status]}`}>
                  {order.status}
                </span>
                <span className="font-bold text-base sm:text-lg">${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <div className="flex -space-x-2">
                {order.items?.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted border-2 border-background flex items-center justify-center overflow-hidden"
                  >
                    {item.productImage ? (
                      <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
                {(order.items?.length || 0) > 3 && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted border-2 border-background flex items-center justify-center text-xs sm:text-sm font-medium">
                    +{(order.items?.length || 0) - 3}
                  </div>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {order.items?.length} {order.items?.length === 1 ? "item" : "items"}
              </span>
              <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

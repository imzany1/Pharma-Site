import { notFound } from "next/navigation"
import { orderRepository, OrderStatus } from "@/lib/repositories"
import Link from "next/link"
import { ArrowLeft, Package, MapPin, CreditCard, User } from "lucide-react"
import { revalidatePath } from "next/cache"

interface Props {
  params: Promise<{ id: string }>
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800",
  CONFIRMED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800",
  PROCESSING: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800",
  SHIPPED: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-800",
  DELIVERED: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
  CANCELLED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800",
}

const allStatuses: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]

async function updateOrderStatus(formData: FormData) {
  "use server"
  
  const orderId = formData.get("orderId") as string
  const newStatus = formData.get("status") as OrderStatus
  
  if (!orderId || !newStatus) return
  
  await orderRepository.updateStatus(orderId, newStatus)
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin/orders")
}

export default async function AdminOrderDetailsPage({ params }: Props) {
  const { id } = await params
  const order = await orderRepository.findById(id)

  if (!order) {
    notFound()
  }

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{order.orderNumber}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
        </div>

        {/* Status Update Form */}
        <form action={updateOrderStatus} className="flex items-center gap-3">
          <input type="hidden" name="orderId" value={order.id} />
          <label className="text-sm font-medium text-gray-500">Status:</label>
          <select 
            name="status"
            defaultValue={order.status}
            className={`px-4 py-2 rounded-xl border font-medium ${statusColors[order.status]}`}
          >
            {allStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button 
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Update
          </button>
        </form>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Package className="w-5 h-5" /> Order Items
            </h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 py-3 border-b border-gray-200 dark:border-gray-800 last:border-0">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{item.productName}</h3>
                    <p className="text-sm text-gray-500">
                      ${item.productPrice.toFixed(2)} × {item.quantity}
                    </p>
                    <p className="text-xs text-gray-400">ID: {item.productId}</p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white shrink-0">${item.total.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className="text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
                <span>Total</span>
                <span className="text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Customer Notes</h3>
              <p className="text-gray-500">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <User className="w-5 h-5" /> Customer
            </h3>
            <div className="text-sm space-y-2">
              <p className="font-medium text-gray-900 dark:text-white">{order.shippingName}</p>
              <p className="text-gray-500">{order.shippingEmail}</p>
              <p className="text-gray-500">{order.shippingPhone}</p>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <MapPin className="w-5 h-5" /> Shipping Address
            </h3>
            <div className="text-gray-500 text-sm space-y-1">
              <p>{order.shippingAddress}</p>
              <p>{order.shippingCity}, {order.shippingState}</p>
              <p>{order.shippingZip}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <CreditCard className="w-5 h-5" /> Payment
            </h3>
            <div className="text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900 dark:text-white">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${
                  order.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-600"
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

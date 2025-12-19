import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { orderRepository } from "@/lib/repositories"
import Link from "next/link"
import { ArrowLeft, Package, MapPin, CreditCard, Clock } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  CONFIRMED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  PROCESSING: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  SHIPPED: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
  DELIVERED: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
}

const statusSteps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"]

export default async function OrderDetailsPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/orders")
  }

  const order = await orderRepository.findById(id)

  if (!order) {
    notFound()
  }

  // Ensure user can only see their own orders
  if (order.userId !== session.user.id) {
    notFound()
  }

  const currentStepIndex = statusSteps.indexOf(order.status)

  return (
    <div className="container px-6 py-12 max-w-4xl mx-auto">
      <Link href="/orders" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-muted-foreground">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusColors[order.status]}`}>
          {order.status}
        </span>
      </div>

      {/* Status Timeline */}
      {order.status !== "CANCELLED" && (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 mb-8">
          <h2 className="font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Order Progress
          </h2>
          
          {/* Desktop/Tablet Horizontal Timeline */}
          <div className="hidden sm:flex items-center justify-between relative z-0">
            {statusSteps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex
              const isCurrent = idx === currentStepIndex
              return (
                <div key={step} className="flex flex-col items-center flex-1 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isCompleted 
                      ? "bg-primary text-white" 
                      : "bg-muted text-muted-foreground"
                  } ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}`}>
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.charAt(0) + step.slice(1).toLowerCase()}
                  </span>
                </div>
              )
            })}
            
            {/* Connector Line Background */}
            <div className="absolute top-4 left-0 w-full h-0.5 bg-muted -z-10" />
            
            {/* Active Connector Line */}
            <div 
              className="absolute top-4 left-0 h-0.5 bg-primary -z-10 transition-all duration-500" 
              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }} 
            />
          </div>

          {/* Mobile Vertical Timeline */}
          <div className="flex sm:hidden flex-col space-y-0 ml-2">
            {statusSteps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex
              const isCurrent = idx === currentStepIndex
              
              return (
                <div key={step} className="flex gap-4 relative">
                  {/* Vertical Line */}
                  {idx < statusSteps.length - 1 && (
                    <div className={`absolute left-4 top-8 bottom-0 w-0.5 -ml-px h-full ${
                      idx < currentStepIndex ? "bg-primary" : "bg-muted"
                    }`} />
                  )}
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 z-10 transition-all ${
                    isCompleted 
                      ? "bg-primary text-white" 
                      : "bg-muted text-muted-foreground"
                  } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  
                  <div className="pb-8 pt-1">
                    <p className={`text-sm font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.charAt(0) + step.slice(1).toLowerCase()}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-primary mt-0.5 font-medium">Current Status</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Order Items
            </h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-3 sm:gap-4 py-3 border-b border-border last:border-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-medium truncate text-sm sm:text-base">{item.productName}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${item.productPrice.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold shrink-0 text-sm sm:text-base">${item.total.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-muted-foreground text-sm sm:text-base">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-sm sm:text-base">
                <span>Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border mt-2">
                <span>Total</span>
                <span className="text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Info Sidebar */}
        <div className="space-y-6">
          {/* Shipping Details */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Shipping Address
            </h3>
            <div className="text-muted-foreground text-sm space-y-1">
              <p className="font-medium text-foreground">{order.shippingName}</p>
              <p>{order.shippingAddress}</p>
              <p>{order.shippingCity}, {order.shippingState}</p>
              <p>{order.shippingZip}</p>
              <p className="pt-2">Phone: {order.shippingPhone}</p>
              <p>Email: {order.shippingEmail}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Payment Details
            </h3>
            <div className="text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium ${
                  order.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-600"
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-2">Order Notes</h3>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

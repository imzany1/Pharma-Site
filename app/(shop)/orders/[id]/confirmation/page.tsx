import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { orderRepository } from "@/lib/repositories"
import Link from "next/link"
import { CheckCircle, Package, ArrowRight } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const order = await orderRepository.findById(id)

  if (!order || order.userId !== session.user.id) {
    redirect("/orders")
  }

  return (
    <div className="container px-6 py-12 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-muted-foreground">
          Thank you for your order. We&apos;ve sent a confirmation email to your inbox.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div>
            <p className="text-sm text-muted-foreground">Order Number</p>
            <p className="font-bold text-lg">{order.orderNumber}</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium">
            {order.status}
          </div>
        </div>

        <h3 className="font-bold mb-4">Order Summary</h3>
        <div className="space-y-3 mb-6">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-medium">₹{item.total.toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span className="text-emerald-600">Free</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-primary">₹{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 mb-8">
        <h3 className="font-bold mb-4">Shipping Details</h3>
        <div className="text-muted-foreground">
          <p className="font-medium text-foreground">{order.shippingName}</p>
          <p>{order.shippingAddress}</p>
          <p>{order.shippingCity}, {order.shippingState} - {order.shippingZip}</p>
          <p>Phone: {order.shippingPhone}</p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm">
            <span className="font-medium">Payment Method:</span>{" "}
            <span className="text-muted-foreground">Cash on Delivery</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/orders"
          className="flex-1 py-3 text-center border border-border rounded-xl font-medium hover:bg-muted transition-colors"
        >
          View All Orders
        </Link>
        <Link
          href="/products"
          className="flex-1 py-3 text-center bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

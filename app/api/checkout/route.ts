import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { orderRepository, CreateOrderItemData } from "@/lib/repositories"
import { Resend } from "resend"

interface CheckoutRequest {
  items: CreateOrderItemData[]
  shipping: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zip: string
  }
  notes?: string
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to checkout" },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const body: CheckoutRequest = await req.json()
    const { items, shipping, notes } = body

    // 3. Validate request
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in cart" },
        { status: 400 }
      )
    }

    if (!shipping.name || !shipping.email || !shipping.phone || 
        !shipping.address || !shipping.city || !shipping.state || !shipping.zip) {
      return NextResponse.json(
        { error: "Please fill in all shipping details" },
        { status: 400 }
      )
    }

    // 4. Create order (handles stock deduction and cart clearing in transaction)
    const order = await orderRepository.create({
      userId: session.user.id,
      items,
      paymentMethod: "COD",
      shippingName: shipping.name,
      shippingEmail: shipping.email,
      shippingPhone: shipping.phone,
      shippingAddress: shipping.address,
      shippingCity: shipping.city,
      shippingState: shipping.state,
      shippingZip: shipping.zip,
      notes: notes || undefined
    })

    // 5. Send confirmation emails (non-blocking)
    sendOrderEmails(order, shipping.email).catch(console.error)

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber
    })

  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    )
  }
}

async function sendOrderEmails(
  order: { orderNumber: string; total: number; shippingName: string; shippingAddress: string; shippingCity: string; shippingState: string; shippingZip: string; items?: { productName: string; quantity: number; total: number }[] },
  customerEmail: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email")
    return
  }

  // Initialize Resend only when API key is available
  const resend = new Resend(process.env.RESEND_API_KEY)

  const itemsHtml = order.items?.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.total.toFixed(2)}</td>
    </tr>
  `).join("") || ""

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0066cc, #004499); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Order Confirmed! 🎉</h1>
      </div>
      
      <div style="padding: 30px; background: #f9fafb;">
        <p style="font-size: 16px;">Hi ${order.shippingName},</p>
        <p>Thank you for your order! Here are your order details:</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px;"><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p style="margin: 0 0 10px;"><strong>Payment Method:</strong> Cash on Delivery</p>
          <p style="margin: 0;"><strong>Total Amount:</strong> $${order.total.toFixed(2)}</p>
        </div>

        <h3>Items Ordered:</h3>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 12px; text-align: left;">Product</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <h3>Shipping Address:</h3>
        <div style="background: white; padding: 15px; border-radius: 8px;">
          <p style="margin: 0;">
            ${order.shippingName}<br>
            ${order.shippingAddress}<br>
            ${order.shippingCity}, ${order.shippingState} - ${order.shippingZip}
          </p>
        </div>

        <p style="margin-top: 30px; color: #666;">
          We'll notify you when your order ships. If you have any questions, please contact us.
        </p>
      </div>
      
      <div style="background: #1a1a1a; color: #999; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">PharmaCorp - Innovating for a Healthier Tomorrow</p>
      </div>
    </div>
  `

  // Send to customer
  await resend.emails.send({
    from: "PharmaCorp Orders <onboarding@resend.dev>",
    to: [customerEmail],
    subject: `Order Confirmed - ${order.orderNumber}`,
    html: emailHtml
  })

  // Send notification to admin
  await resend.emails.send({
    from: "PharmaCorp Orders <onboarding@resend.dev>",
    to: ["hussainabbas7492@gmail.com"],
    subject: `[NEW ORDER] ${order.orderNumber} - $${order.total.toFixed(2)}`,
    html: `
      <h2>New Order Received!</h2>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Customer:</strong> ${order.shippingName} (${customerEmail})</p>
      <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
      <p><strong>Payment:</strong> Cash on Delivery</p>
      <hr>
      <h3>Shipping Address:</h3>
      <p>${order.shippingAddress}, ${order.shippingCity}, ${order.shippingState} - ${order.shippingZip}</p>
    `
  })
}

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET: Fetch user's cart
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] })
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id }
    })

    const items = cartItems.map((item: { productId: string; quantity: number }) => ({
      productId: item.productId,
      quantity: item.quantity
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Failed to fetch cart:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

// PUT: Replace entire cart
export async function PUT(request: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { items } = await request.json()
    
    // Delete all existing items
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id }
    })

    // Insert new items
    if (items && items.length > 0) {
      await prisma.cartItem.createMany({
        data: items.map((item: { productId: string; quantity: number }) => ({
          userId: session.user.id,
          productId: item.productId,
          quantity: item.quantity
        }))
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update cart:", error)
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 })
  }
}

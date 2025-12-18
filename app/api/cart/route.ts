import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { cartRepository } from "@/lib/repositories"

// GET: Fetch user's cart
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] })
  }

  try {
    const cartItems = await cartRepository.findByUser(session.user.id)

    const items = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Failed to fetch cart:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

// PUT: Replace entire cart using upsert for each item
export async function PUT(request: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { items } = await request.json()
    
    await cartRepository.replaceCart(session.user.id, items || [])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update cart:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update cart"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface CartItemInput {
  productId: string
  quantity: number
}

// POST: Merge guest cart with user cart
export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { guestItems } = await request.json() as { guestItems: CartItemInput[] }
    
    if (!guestItems || !Array.isArray(guestItems)) {
      return NextResponse.json({ error: "Invalid guest items" }, { status: 400 })
    }

    // Get existing user cart items
    const existingItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id }
    })

    const existingMap: Map<string, { id: string; quantity: number }> = new Map()
    for (const item of existingItems) {
      existingMap.set(item.productId, { id: item.id, quantity: item.quantity })
    }

    // Merge: for each guest item, add to existing or create new
    for (const guestItem of guestItems) {
      const existing = existingMap.get(guestItem.productId)
      
      if (existing) {
        // Update quantity (add guest quantity to existing)
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + guestItem.quantity }
        })
      } else {
        // Create new item
        await prisma.cartItem.create({
          data: {
            userId: session.user.id,
            productId: guestItem.productId,
            quantity: guestItem.quantity
          }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to merge cart:", error)
    return NextResponse.json({ error: "Failed to merge cart" }, { status: 500 })
  }
}

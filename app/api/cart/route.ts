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

  const userId = session.user.id

  try {
    const { items } = await request.json()
    
    // Get current cart items
    const currentItems = await prisma.cartItem.findMany({
      where: { userId },
      select: { productId: true }
    })
    const currentProductIds = new Set(currentItems.map(i => i.productId))
    
    // Prepare new items map
    const newItemsMap = new Map<string, number>()
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.productId && typeof item.productId === 'string' && item.quantity > 0) {
          newItemsMap.set(item.productId, item.quantity)
        }
      }
    }
    
    // Find items to delete (in current but not in new)
    const toDelete = [...currentProductIds].filter(id => !newItemsMap.has(id))
    
    // Use transaction for all operations
    await prisma.$transaction(async (tx) => {
      // Delete removed items
      if (toDelete.length > 0) {
        await tx.cartItem.deleteMany({
          where: {
            userId,
            productId: { in: toDelete }
          }
        })
      }
      
      // Upsert each item (update if exists, create if not)
      for (const [productId, quantity] of newItemsMap) {
        await tx.cartItem.upsert({
          where: {
            userId_productId: { userId, productId }
          },
          update: { quantity },
          create: { userId, productId, quantity }
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update cart:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update cart"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}




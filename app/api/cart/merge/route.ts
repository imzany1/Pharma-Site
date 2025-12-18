import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { cartRepository, CartItemInput } from "@/lib/repositories"

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

    await cartRepository.mergeGuestCart(session.user.id, guestItems)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to merge cart:", error)
    return NextResponse.json({ error: "Failed to merge cart" }, { status: 500 })
  }
}

"use server"

import { productRepository, CartItemInput } from "@/lib/repositories"
import { revalidatePath } from "next/cache"

export async function processCheckout(items: CartItemInput[]) {
  console.log("=== CHECKOUT STARTED ===")
  console.log("Items received:", JSON.stringify(items, null, 2))
  
  if (!items.length) {
    console.log("ERROR: Cart is empty")
    return { success: false, error: "Cart is empty" }
  }

  const error = await productRepository.processCheckout(items)
  
  if (error) {
    console.error("=== CHECKOUT ERROR ===", error)
    return { success: false, error }
  }

  console.log("=== CHECKOUT SUCCESS ===")

  // Revalidate products page to show updated stock immediately
  revalidatePath("/products")
  revalidatePath("/admin/products")
  revalidatePath("/admin")
  
  return { success: true }
}

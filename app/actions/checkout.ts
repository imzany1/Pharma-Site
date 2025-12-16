"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

type CheckoutItem = {
  productId: string
  quantity: number
}

export async function processCheckout(items: CheckoutItem[]) {
  console.log("=== CHECKOUT STARTED ===")
  console.log("Items received:", JSON.stringify(items, null, 2))
  
  if (!items.length) {
    console.log("ERROR: Cart is empty")
    return { success: false, error: "Cart is empty" }
  }

  try {
    // Use a transaction to ensure all stock updates succeed or fail together
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        console.log(`Processing item: ${item.productId}, quantity: ${item.quantity}`)
        
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        })

        console.log(`Found product:`, product ? product.name : "NOT FOUND")

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`)
        }

        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`)
        }

        const newQuantity = product.quantity - item.quantity
        console.log(`Updating ${product.name}: ${product.quantity} -> ${newQuantity}`)

        // Deduct stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: newQuantity,
            // Automatically mark out of stock if quantity reaches 0
            inStock: newQuantity > 0
          }
        })
        
        console.log(`Successfully updated ${product.name}`)
      }
    })

    console.log("=== CHECKOUT SUCCESS ===")

    // Revalidate products page to show updated stock immediately
    revalidatePath("/products")
    revalidatePath("/admin/products")
    revalidatePath("/admin")
    
    return { success: true }
  } catch (error) {
    console.error("=== CHECKOUT ERROR ===", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Checkout failed" 
    }
  }
}


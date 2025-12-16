"use server"

import { prisma } from "@/lib/prisma"
import { Product } from "@/lib/products"

export async function getCartProducts(ids: string[]) {
  if (!ids.length) return []

  try {
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: ids
        }
      }
    })
    
    // Maintain the order of IDs if possible, or just return the list
    // A map might be useful for the client, but returning the list is standard
    return products as Product[]
  } catch (error) {
    console.error("Error fetching cart products:", error)
    return []
  }
}

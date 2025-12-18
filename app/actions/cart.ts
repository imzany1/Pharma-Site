"use server"

import { productRepository, Product } from "@/lib/repositories"

export async function getCartProducts(ids: string[]): Promise<Product[]> {
  if (!ids.length) return []
  return productRepository.findByIds(ids)
}

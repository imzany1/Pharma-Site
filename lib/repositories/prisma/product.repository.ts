/**
 * Prisma implementation of IProductRepository
 */

import { prisma } from "@/lib/prisma"
import type { IProductRepository } from "../interfaces"
import type { 
  Product, 
  CreateProductData, 
  UpdateProductData, 
  ProductFilter,
  InventoryStats,
  CartItemInput
} from "../types"

export class PrismaProductRepository implements IProductRepository {
  async findAll(orderBy: "name" | "price" | "createdAt" = "name"): Promise<Product[]> {
    return prisma.product.findMany({
      orderBy: { [orderBy]: "asc" }
    })
  }

  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id }
    })
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (!ids.length) return []
    return prisma.product.findMany({
      where: {
        id: { in: ids }
      }
    })
  }

  async create(data: CreateProductData): Promise<Product> {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        image: data.image,
        inStock: data.inStock ?? true,
        quantity: data.quantity ?? 0
      }
    })
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id }
    })
  }

  async count(filter?: ProductFilter): Promise<number> {
    const where: Record<string, unknown> = {}
    
    if (filter?.inStock !== undefined) {
      where.inStock = filter.inStock
    }
    
    if (filter?.lowStock) {
      where.quantity = { lte: 10, gt: 0 }
    }
    
    if (filter?.outOfStock) {
      where.inStock = false
    }

    return prisma.product.count({ where })
  }

  async getInventoryStats(): Promise<InventoryStats> {
    const [totalProducts, lowStockCount, outOfStockCount, products] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { quantity: { lte: 10, gt: 0 } } }),
      prisma.product.count({ where: { inStock: false } }),
      prisma.product.findMany({ select: { price: true, quantity: true } })
    ])

    const totalInventoryValue = products.reduce(
      (sum, p) => sum + (p.price * p.quantity), 
      0
    )

    return {
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalInventoryValue
    }
  }

  async findRecent(limit: number): Promise<Product[]> {
    return prisma.product.findMany({
      take: limit,
      orderBy: { createdAt: "desc" }
    })
  }

  async processCheckout(items: CartItemInput[]): Promise<string | null> {
    if (!items.length) {
      return "Cart is empty"
    }

    try {
      await prisma.$transaction(async (tx) => {
        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          })

          if (!product) {
            throw new Error(`Product with ID ${item.productId} not found`)
          }

          if (product.quantity < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}`)
          }

          const newQuantity = product.quantity - item.quantity

          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: newQuantity,
              inStock: newQuantity > 0
            }
          })
        }
      })

      return null // Success
    } catch (error) {
      return error instanceof Error ? error.message : "Checkout failed"
    }
  }
}

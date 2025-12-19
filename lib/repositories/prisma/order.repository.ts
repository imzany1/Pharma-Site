/**
 * Prisma implementation of IOrderRepository
 */

import { prisma } from "@/lib/prisma"
import type { IOrderRepository } from "../interfaces"
import type { Order, OrderStatus, CreateOrderData } from "../types"

// Generate order number like ORD-20231219-XXXX
function generateOrderNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${dateStr}-${random}`
}

export class PrismaOrderRepository implements IOrderRepository {
  async create(data: CreateOrderData): Promise<Order> {
    const orderNumber = generateOrderNumber()
    
    // Calculate totals
    const subtotal = data.items.reduce(
      (sum, item) => sum + (item.productPrice * item.quantity), 
      0
    )
    const total = subtotal // Free shipping, taxes included

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Verify stock and deduct quantities
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        })

        if (!product) {
          throw new Error(`Product ${item.productId} not found`)
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

      // 2. Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: data.userId,
          paymentMethod: data.paymentMethod || "COD",
          shippingName: data.shippingName,
          shippingEmail: data.shippingEmail,
          shippingPhone: data.shippingPhone,
          shippingAddress: data.shippingAddress,
          shippingCity: data.shippingCity,
          shippingState: data.shippingState,
          shippingZip: data.shippingZip,
          subtotal,
          total,
          notes: data.notes || null,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              productName: item.productName,
              productImage: item.productImage,
              productPrice: item.productPrice,
              quantity: item.quantity,
              total: item.productPrice * item.quantity
            }))
          }
        },
        include: {
          items: true
        }
      })

      // 3. Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId: data.userId }
      })

      return newOrder
    })

    return order as Order
  }

  async findById(id: string): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    })
    return order as Order | null
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true }
    })
    return order as Order | null
  }

  async findByUser(userId: string): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" }
    })
    return orders as Order[]
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: options?.limit,
      skip: options?.offset
    })
    return orders as Order[]
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true }
    })
    return order as Order
  }

  async count(filter?: { userId?: string; status?: OrderStatus }): Promise<number> {
    return prisma.order.count({
      where: {
        userId: filter?.userId,
        status: filter?.status
      }
    })
  }

  async getRecentOrders(limit: number): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { items: true }
    })
    return orders as Order[]
  }

  async getOrderStats(): Promise<{
    totalOrders: number
    pendingOrders: number
    todayRevenue: number
    totalRevenue: number
  }> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalOrders, pendingOrders, allOrders, todayOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.findMany({ select: { total: true } }),
      prisma.order.findMany({
        where: { createdAt: { gte: today } },
        select: { total: true }
      })
    ])

    const totalRevenue = allOrders.reduce((sum: number, o: { total: number }) => sum + o.total, 0)
    const todayRevenue = todayOrders.reduce((sum: number, o: { total: number }) => sum + o.total, 0)

    return {
      totalOrders,
      pendingOrders,
      todayRevenue,
      totalRevenue
    }
  }
}

/**
 * Prisma implementation of ICartRepository
 */

import { prisma } from "@/lib/prisma"
import type { ICartRepository } from "../interfaces"
import type { CartItem, CartItemInput } from "../types"

export class PrismaCartRepository implements ICartRepository {
  async findByUser(userId: string): Promise<CartItem[]> {
    return prisma.cartItem.findMany({
      where: { userId }
    })
  }

  async upsertItem(userId: string, productId: string, quantity: number): Promise<void> {
    await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId, productId }
      },
      update: { quantity },
      create: { userId, productId, quantity }
    })
  }

  async deleteItem(userId: string, productId: string): Promise<void> {
    await prisma.cartItem.delete({
      where: {
        userId_productId: { userId, productId }
      }
    }).catch(() => {
      // Ignore if item doesn't exist
    })
  }

  async clearCart(userId: string): Promise<void> {
    await prisma.cartItem.deleteMany({
      where: { userId }
    })
  }

  async replaceCart(userId: string, items: CartItemInput[]): Promise<void> {
    // Get current cart items
    const currentItems = await prisma.cartItem.findMany({
      where: { userId },
      select: { productId: true }
    })
    const currentProductIds = new Set(currentItems.map(i => i.productId))

    // Prepare new items map
    const newItemsMap = new Map<string, number>()
    for (const item of items) {
      if (item.productId && item.quantity > 0) {
        newItemsMap.set(item.productId, item.quantity)
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

      // Upsert each item
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
  }

  async mergeGuestCart(userId: string, guestItems: CartItemInput[]): Promise<void> {
    if (!guestItems.length) return

    // Get existing cart items for this user
    const existingItems = await prisma.cartItem.findMany({
      where: { userId },
      select: { productId: true, quantity: true }
    })
    const existingMap = new Map(existingItems.map(i => [i.productId, i.quantity]))

    // Merge guest items - add quantities if item exists, create if not
    for (const guestItem of guestItems) {
      const existingQty = existingMap.get(guestItem.productId)
      
      if (existingQty !== undefined) {
        // Item exists, update quantity (add guest quantity to existing)
        await prisma.cartItem.update({
          where: { userId_productId: { userId, productId: guestItem.productId } },
          data: { quantity: existingQty + guestItem.quantity }
        })
      } else {
        // Item doesn't exist, create it
        await prisma.cartItem.create({
          data: {
            userId,
            productId: guestItem.productId,
            quantity: guestItem.quantity
          }
        })
      }
    }
  }
}

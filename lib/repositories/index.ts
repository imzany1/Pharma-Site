/**
 * Repository Layer Central Export
 * 
 * This is the ONLY file that knows about the concrete Prisma implementations.
 * To switch ORMs, only this file and the prisma/ folder need to change.
 */

import { PrismaUserRepository } from "./prisma/user.repository"
import { PrismaProductRepository } from "./prisma/product.repository"
import { PrismaCartRepository } from "./prisma/cart.repository"
import { PrismaOrderRepository } from "./prisma/order.repository"

// Export singleton instances
export const userRepository = new PrismaUserRepository()
export const productRepository = new PrismaProductRepository()
export const cartRepository = new PrismaCartRepository()
export const orderRepository = new PrismaOrderRepository()

// Re-export interfaces for typing
export type { 
  IUserRepository, 
  IProductRepository, 
  ICartRepository,
  IOrderRepository
} from "./interfaces"

// Re-export types for convenience
export type {
  User,
  UserPublic,
  CreateUserData,
  Product,
  CreateProductData,
  UpdateProductData,
  ProductFilter,
  InventoryStats,
  CartItem,
  CartItemInput,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  CreateOrderData,
  CreateOrderItemData,
} from "./types"

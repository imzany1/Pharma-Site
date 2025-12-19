/**
 * Repository Interfaces
 * These define the contracts for data access operations.
 * Any ORM implementation must satisfy these interfaces.
 */

import type {
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
  CreateOrderData,
} from "./types"

// ============ User Repository ============
export interface IUserRepository {
  /**
   * Find a user by their unique ID
   */
  findById(id: string): Promise<User | null>

  /**
   * Find a user by their unique ID, returning only public fields
   */
  findByIdPublic(id: string): Promise<UserPublic | null>

  /**
   * Find a user by their email address
   */
  findByEmail(email: string): Promise<User | null>

  /**
   * Create a new user
   */
  create(data: CreateUserData): Promise<User>

  /**
   * Check if a user exists with the given email
   */
  existsByEmail(email: string): Promise<boolean>
}

// ============ Product Repository ============
export interface IProductRepository {
  /**
   * Get all products with optional ordering
   */
  findAll(orderBy?: "name" | "price" | "createdAt"): Promise<Product[]>

  /**
   * Find a product by its unique ID
   */
  findById(id: string): Promise<Product | null>

  /**
   * Find multiple products by their IDs
   */
  findByIds(ids: string[]): Promise<Product[]>

  /**
   * Create a new product
   */
  create(data: CreateProductData): Promise<Product>

  /**
   * Update an existing product
   */
  update(id: string, data: UpdateProductData): Promise<Product>

  /**
   * Delete a product by ID
   */
  delete(id: string): Promise<void>

  /**
   * Count products with optional filter
   */
  count(filter?: ProductFilter): Promise<number>

  /**
   * Get inventory statistics for dashboard
   */
  getInventoryStats(): Promise<InventoryStats>

  /**
   * Get recent products for dashboard
   */
  findRecent(limit: number): Promise<Product[]>

  /**
   * Process checkout - deduct stock in a transaction
   * Returns error message if failed, null if success
   */
  processCheckout(items: CartItemInput[]): Promise<string | null>
}

// ============ Cart Repository ============
export interface ICartRepository {
  /**
   * Get all cart items for a user
   */
  findByUser(userId: string): Promise<CartItem[]>

  /**
   * Add or update an item in user's cart
   */
  upsertItem(userId: string, productId: string, quantity: number): Promise<void>

  /**
   * Remove an item from user's cart
   */
  deleteItem(userId: string, productId: string): Promise<void>

  /**
   * Clear all items from user's cart
   */
  clearCart(userId: string): Promise<void>

  /**
   * Replace entire cart with new items (transactional)
   */
  replaceCart(userId: string, items: CartItemInput[]): Promise<void>

  /**
   * Merge guest cart items into user's cart
   */
  mergeGuestCart(userId: string, guestItems: CartItemInput[]): Promise<void>
}

// ============ Order Repository ============
export interface IOrderRepository {
  /**
   * Create a new order with items (atomic transaction with stock deduction)
   */
  create(data: CreateOrderData): Promise<Order>

  /**
   * Find an order by its unique ID
   */
  findById(id: string): Promise<Order | null>

  /**
   * Find an order by its order number
   */
  findByOrderNumber(orderNumber: string): Promise<Order | null>

  /**
   * Get all orders for a specific user
   */
  findByUser(userId: string): Promise<Order[]>

  /**
   * Get all orders with pagination
   */
  findAll(options?: { limit?: number; offset?: number }): Promise<Order[]>

  /**
   * Update order status
   */
  updateStatus(id: string, status: OrderStatus): Promise<Order>

  /**
   * Update payment status
   */
  updatePaymentStatus(id: string, status: "PAID" | "UNPAID" | "FAILED"): Promise<Order>

  /**
   * Count orders with optional filter
   */
  count(filter?: { userId?: string; status?: OrderStatus }): Promise<number>

  /**
   * Get recent orders for dashboard
   */
  getRecentOrders(limit: number): Promise<Order[]>

  /**
   * Get order statistics for admin dashboard
   */
  getOrderStats(): Promise<{
    totalOrders: number
    pendingOrders: number
    todayRevenue: number
    totalRevenue: number
  }>
}

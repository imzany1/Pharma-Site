/**
 * Shared types for repository layer
 * These types are ORM-agnostic and define the data shapes
 */

// ============ User Types ============
export interface User {
  id: string
  email: string
  password: string
  name: string | null
  isAdmin: boolean
  createdAt: Date
}

export interface UserPublic {
  id: string
  email: string
  name: string | null
  isAdmin: boolean
}

export interface CreateUserData {
  email: string
  password: string
  name?: string
  isAdmin?: boolean
}

// ============ Product Types ============
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  inStock: boolean
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductData {
  name: string
  description: string
  price: number
  category: string
  image: string
  inStock?: boolean
  quantity?: number
}

export interface UpdateProductData {
  name?: string
  description?: string
  price?: number
  category?: string
  image?: string
  inStock?: boolean
  quantity?: number
}

export interface ProductFilter {
  inStock?: boolean
  lowStock?: boolean  // quantity <= 10 and > 0
  outOfStock?: boolean // quantity = 0 or inStock = false
}

export interface InventoryStats {
  totalProducts: number
  lowStockCount: number
  outOfStockCount: number
  totalInventoryValue: number
}

// ============ Cart Types ============
export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  createdAt: Date
}

export interface CartItemInput {
  productId: string
  quantity: number
}

// ============ Order Types ============
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED'

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  shippingName: string
  shippingEmail: string
  shippingPhone: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingZip: string
  subtotal: number
  total: number
  notes: string | null
  createdAt: Date
  updatedAt: Date
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  productImage: string
  productPrice: number
  quantity: number
  total: number
}

export interface CreateOrderItemData {
  productId: string
  productName: string
  productImage: string
  productPrice: number
  quantity: number
}

export interface CreateOrderData {
  userId: string
  items: CreateOrderItemData[]
  paymentMethod?: string
  shippingName: string
  shippingEmail: string
  shippingPhone: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingZip: string
  notes?: string
}

// ============ Transaction Types ============
export interface TransactionContext {
  // Abstraction for transactional operations
  // Implementations will handle this differently
}

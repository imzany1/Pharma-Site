"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useSession } from "next-auth/react"

export interface CartItem {
  productId: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (productId: string, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  isLoading: boolean
  mergeGuestCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const GUEST_CART_KEY = "pharma_guest_cart"

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load cart on mount
  useEffect(() => {
    if (status === "loading") return
    
    if (session?.user) {
      // Logged in: fetch from DB
      fetchUserCart()
    } else {
      // Guest: load from localStorage
      loadGuestCart()
    }
  }, [session, status])

  const loadGuestCart = () => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem(GUEST_CART_KEY)
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch {
        setItems([])
      }
    } else {
      setItems([])
    }
    setIsLoading(false)
  }

  const saveGuestCart = (cart: CartItem[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))
  }

  const fetchUserCart = async () => {
    try {
      const res = await fetch("/api/cart")
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const syncToServer = async (newItems: CartItem[]) => {
    if (!session?.user) return
    try {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: newItems })
      })
    } catch (error) {
      console.error("Failed to sync cart:", error)
    }
  }

  const addItem = (productId: string, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.productId === productId)
      let newItems: CartItem[]
      if (existing) {
        newItems = prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        newItems = [...prev, { productId, quantity }]
      }
      
      if (session?.user) {
        syncToServer(newItems)
      } else {
        saveGuestCart(newItems)
      }
      return newItems
    })
  }

  const removeItem = (productId: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.productId !== productId)
      if (session?.user) {
        syncToServer(newItems)
      } else {
        saveGuestCart(newItems)
      }
      return newItems
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems(prev => {
      const newItems = prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
      if (session?.user) {
        syncToServer(newItems)
      } else {
        saveGuestCart(newItems)
      }
      return newItems
    })
  }

  const clearCart = () => {
    setItems([])
    if (session?.user) {
      syncToServer([])
    } else {
      localStorage.removeItem(GUEST_CART_KEY)
    }
  }

  const mergeGuestCart = useCallback(async () => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem(GUEST_CART_KEY)
    if (!stored) return
    
    try {
      const guestItems: CartItem[] = JSON.parse(stored)
      if (guestItems.length === 0) return
      
      const res = await fetch("/api/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestItems })
      })
      
      if (res.ok) {
        localStorage.removeItem(GUEST_CART_KEY)
        await fetchUserCart()
      }
    } catch (error) {
      console.error("Failed to merge cart:", error)
    }
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      isLoading,
      mergeGuestCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

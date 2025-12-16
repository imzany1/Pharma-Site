"use client"

import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface DeleteProductButtonProps {
  productId: string
  productName: string
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert("Failed to delete product")
      }
    } catch {
      alert("An error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  )
}

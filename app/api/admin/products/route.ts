import { auth } from "@/lib/auth"
import { userRepository, productRepository } from "@/lib/repositories"
import { NextResponse } from "next/server"

// GET /api/admin/products - List all products
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await userRepository.findByIdPublic(session.user.id)

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const products = await productRepository.findAll("createdAt")

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await userRepository.findByIdPublic(session.user.id)

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, price, category, image, inStock, quantity } = body

    // Validate required fields
    if (!name || !description || price === undefined || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const product = await productRepository.create({
      name,
      description,
      price: parseFloat(price),
      category,
      image: image || "/products/default.jpg",
      inStock: inStock ?? true,
      quantity: parseInt(quantity) || 0
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

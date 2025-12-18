/**
 * Product data access layer
 * Uses repository pattern for database abstraction
 */

import { productRepository, Product } from "@/lib/repositories"

// Re-export Product type for backwards compatibility
export type { Product }

// Fetch all products from database
export async function getAllProducts(): Promise<Product[]> {
  return productRepository.findAll("name")
}

// Fetch a single product by ID
export async function getProductById(id: string): Promise<Product | null> {
  return productRepository.findById(id)
}

// For backwards compatibility - static products for fallback/initial display
export const staticProducts: Product[] = [
  {
    id: "med-001",
    name: "CardioGuard Plus",
    description: "Advanced cardiovascular support formula with omega-3 fatty acids and CoQ10 for heart health.",
    price: 49.99,
    category: "Heart Health",
    image: "/products/cardioguard.jpg",
    inStock: true,
    quantity: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "med-002",
    name: "ImmunoBoost Pro",
    description: "Comprehensive immune system support with Vitamin C, D3, Zinc, and Elderberry extract.",
    price: 34.99,
    category: "Immunity",
    image: "/products/immunoboost.jpg",
    inStock: true,
    quantity: 150,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "med-003",
    name: "NeuroCalm",
    description: "Natural stress relief and cognitive support with Ashwagandha, L-Theanine, and B-vitamins.",
    price: 42.99,
    category: "Mental Wellness",
    image: "/products/neurocalm.jpg",
    inStock: true,
    quantity: 80,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "med-004",
    name: "JointFlex Advanced",
    description: "Premium joint support with Glucosamine, Chondroitin, MSM, and Turmeric for mobility.",
    price: 54.99,
    category: "Joint Health",
    image: "/products/jointflex.jpg",
    inStock: true,
    quantity: 60,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "med-005",
    name: "DigestEase",
    description: "Probiotic blend with digestive enzymes for optimal gut health and nutrient absorption.",
    price: 29.99,
    category: "Digestive Health",
    image: "/products/digestease.jpg",
    inStock: true,
    quantity: 200,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "med-006",
    name: "VitaWell Complete",
    description: "Daily multivitamin with essential minerals for overall health and vitality.",
    price: 24.99,
    category: "General Wellness",
    image: "/products/vitawell.jpg",
    inStock: false,
    quantity: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "med-007",
    name: "SleepSerene",
    description: "Natural sleep aid with Melatonin, Valerian Root, and Magnesium for restful nights.",
    price: 27.99,
    category: "Sleep Support",
    image: "/products/sleepserene.jpg",
    inStock: true,
    quantity: 120,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "med-008",
    name: "EnerGize Max",
    description: "Sustained energy formula with B-Complex, Iron, and natural adaptogens.",
    price: 39.99,
    category: "Energy",
    image: "/products/energize.jpg",
    inStock: true,
    quantity: 90,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// Legacy export for backwards compatibility
export const products = staticProducts

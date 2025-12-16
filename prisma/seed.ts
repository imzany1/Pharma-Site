import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const products = [
  {
    name: "CardioGuard Plus",
    description: "Advanced cardiovascular support formula with omega-3 fatty acids and CoQ10 for heart health.",
    price: 49.99,
    category: "Heart Health",
    image: "/products/cardioguard.jpg",
    inStock: true,
    quantity: 100
  },
  {
    name: "ImmunoBoost Pro",
    description: "Comprehensive immune system support with Vitamin C, D3, Zinc, and Elderberry extract.",
    price: 34.99,
    category: "Immunity",
    image: "/products/immunoboost.jpg",
    inStock: true,
    quantity: 150
  },
  {
    name: "NeuroCalm",
    description: "Natural stress relief and cognitive support with Ashwagandha, L-Theanine, and B-vitamins.",
    price: 42.99,
    category: "Mental Wellness",
    image: "/products/neurocalm.jpg",
    inStock: true,
    quantity: 80
  },
  {
    name: "JointFlex Advanced",
    description: "Premium joint support with Glucosamine, Chondroitin, MSM, and Turmeric for mobility.",
    price: 54.99,
    category: "Joint Health",
    image: "/products/jointflex.jpg",
    inStock: true,
    quantity: 60
  },
  {
    name: "DigestEase",
    description: "Probiotic blend with digestive enzymes for optimal gut health and nutrient absorption.",
    price: 29.99,
    category: "Digestive Health",
    image: "/products/digestease.jpg",
    inStock: true,
    quantity: 200
  },
  {
    name: "VitaWell Complete",
    description: "Daily multivitamin with essential minerals for overall health and vitality.",
    price: 24.99,
    category: "General Wellness",
    image: "/products/vitawell.jpg",
    inStock: false,
    quantity: 0
  },
  {
    name: "SleepSerene",
    description: "Natural sleep aid with Melatonin, Valerian Root, and Magnesium for restful nights.",
    price: 27.99,
    category: "Sleep Support",
    image: "/products/sleepserene.jpg",
    inStock: true,
    quantity: 120
  },
  {
    name: "EnerGize Max",
    description: "Sustained energy formula with B-Complex, Iron, and natural adaptogens.",
    price: 39.99,
    category: "Energy",
    image: "/products/energize.jpg",
    inStock: true,
    quantity: 90
  }
]

async function main() {
  console.log('Starting database seed...')
  
  // Clear existing products
  await prisma.product.deleteMany()
  console.log('Cleared existing products')
  
  // Seed products
  for (const product of products) {
    await prisma.product.create({
      data: product
    })
    console.log(`Created product: ${product.name}`)
  }
  
  console.log('Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

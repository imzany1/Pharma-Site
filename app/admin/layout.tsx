import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { LayoutDashboard, Package, LogOut, Home } from "lucide-react"
import { signOut } from "@/lib/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin")
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true, name: true, email: true }
  })

  if (!user?.isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-20 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 z-40">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
        </div>
        
        <nav className="space-y-2">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link 
            href="/admin/products" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Package className="w-5 h-5" />
            Products
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full"
          >
            <Home className="w-5 h-5" />
            Back to Site
          </Link>
          <form action={async () => {
            "use server"
            await signOut({ redirectTo: "/" })
          }}>
            <button 
              type="submit"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}

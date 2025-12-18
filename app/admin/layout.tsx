import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { userRepository } from "@/lib/repositories"
import { AdminSidebar } from "./AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin")
  }

  const user = await userRepository.findByIdPublic(session.user.id)

  // We know isAdmin is boolean from schema, but Prisma types can be strict
  if (!user || !user.isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar Component */}
      <AdminSidebar user={user} />

      {/* Main content */}
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

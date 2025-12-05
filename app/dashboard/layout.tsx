"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

      setUserType(profile?.user_type || "buyer")
      setIsLoading(false)
    }

    getUser()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="text-2xl font-bold text-primary">Krishi Connect</div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground capitalize">{userType}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </nav>

      {/* Sidebar + Content */}
      <div className="flex">
        <aside className="w-64 border-r border-border bg-card min-h-[calc(100vh-64px)]">
          <nav className="p-4 space-y-2">
            {userType === "farmer" && (
              <>
                <Link href="/dashboard/farmer">
                  <Button variant="ghost" className="w-full justify-start">
                    My Crops
                  </Button>
                </Link>
                <Link href="/dashboard/farmer/list">
                  <Button variant="ghost" className="w-full justify-start">
                    List New Crop
                  </Button>
                </Link>
                <Link href="/dashboard/farmer/bids">
                  <Button variant="ghost" className="w-full justify-start">
                    My Bids
                  </Button>
                </Link>
                <Link href="/dashboard/farmer/msp">
                  <Button variant="ghost" className="w-full justify-start">
                    MSP Prices
                  </Button>
                </Link>
              </>
            )}

            {userType === "buyer" && (
              <>
                <Link href="/dashboard/buyer">
                  <Button variant="ghost" className="w-full justify-start">
                    Browse Crops
                  </Button>
                </Link>
                <Link href="/dashboard/buyer/my-bids">
                  <Button variant="ghost" className="w-full justify-start">
                    My Offers
                  </Button>
                </Link>
              </>
            )}

            {userType === "admin" && (
              <>
                <Link href="/dashboard/admin">
                  <Button variant="ghost" className="w-full justify-start">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/admin/users">
                  <Button variant="ghost" className="w-full justify-start">
                    Manage Users
                  </Button>
                </Link>
                <Link href="/dashboard/admin/msp">
                  <Button variant="ghost" className="w-full justify-start">
                    MSP Prices
                  </Button>
                </Link>
                <Link href="/dashboard/admin/transactions">
                  <Button variant="ghost" className="w-full justify-start">
                    Transactions
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

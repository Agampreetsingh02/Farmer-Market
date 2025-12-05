"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

interface Stats {
  users: number
  listings: number
  transactions: number
  totalRevenue: number
}

interface User {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

interface MSPPrice {
  id: string
  crop_id: string
  price: number
  crops: {
    name: string
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ users: 0, listings: 0, transactions: 0, totalRevenue: 0 })
  const [users, setUsers] = useState<User[]>([])
  const [mspPrices, setMSPPrices] = useState<MSPPrice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingMSP, setEditingMSP] = useState<string | null>(null)
  const [mspNewPrice, setMSPNewPrice] = useState<number>(0)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const [usersRes, listingsRes, transactionsRes, mspRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("crop_listings").select("id", { count: "exact" }),
        supabase.from("transactions").select("amount", { count: "exact" }),
        supabase.from("msp_prices").select("*, crops(name)"),
      ])

      const totalRevenue = transactionsRes.data?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0

      setStats({
        users: usersRes.data?.length || 0,
        listings: listingsRes.count || 0,
        transactions: transactionsRes.count || 0,
        totalRevenue,
      })

      setUsers(usersRes.data || [])
      setMSPPrices(mspRes.data || [])
      setIsLoading(false)
    }

    fetchData()
  }, [supabase])

  const handleUpdateMSP = async (mspId: string) => {
    if (!mspNewPrice || mspNewPrice <= 0) return

    const { error } = await supabase.from("msp_prices").update({ price: mspNewPrice }).eq("id", mspId)

    if (!error) {
      setMSPPrices(mspPrices.map((m) => (m.id === mspId ? { ...m, price: mspNewPrice } : m)))
      setEditingMSP(null)
      setMSPNewPrice(0)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    const { error } = await supabase.from("profiles").delete().eq("id", userId)

    if (!error) {
      setUsers(users.filter((u) => u.id !== userId))
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.users}</p>
            <CardDescription>Farmers, Buyers, and Admins</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.listings}</p>
            <CardDescription>Crop listings available</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.transactions}</p>
            <CardDescription>Total deals completed</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
            <CardDescription>Platform commission collected</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="msp">MSP Prices</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
              <CardDescription>Manage platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-2">Name</th>
                          <th className="text-left py-2">Email</th>
                          <th className="text-left py-2">Role</th>
                          <th className="text-left py-2">Joined</th>
                          <th className="text-left py-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b">
                            <td className="py-2">{user.full_name}</td>
                            <td className="py-2">{user.email}</td>
                            <td className="py-2">
                              <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                                {user.role}
                              </span>
                            </td>
                            <td className="py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                            <td className="py-2">
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No users found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="msp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MSP Prices</CardTitle>
              <CardDescription>Update government Minimum Support Prices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mspPrices.length > 0 ? (
                  mspPrices.map((msp) => (
                    <div key={msp.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-semibold">{msp.crops.name}</p>
                        <p className="text-sm text-muted-foreground">Current: ₹{msp.price}</p>
                      </div>
                      <div className="flex gap-2">
                        {editingMSP === msp.id ? (
                          <>
                            <Input
                              type="number"
                              placeholder="New price"
                              value={mspNewPrice}
                              onChange={(e) => setMSPNewPrice(Number(e.target.value))}
                              className="w-32"
                            />
                            <Button size="sm" onClick={() => handleUpdateMSP(msp.id)}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingMSP(null)}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingMSP(msp.id)
                              setMSPNewPrice(msp.price)
                            }}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No MSP prices found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

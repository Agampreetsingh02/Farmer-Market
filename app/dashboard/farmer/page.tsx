"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { MSPAlertBanner } from "@/components/msp-alert-banner"

export default function FarmerDashboard() {
  const [listings, setListings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchListings = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase.from("crop_listings").select("*, crops(name, unit)").eq("farmer_id", user.id)

      setListings(data || [])
      setIsLoading(false)
    }

    fetchListings()
  }, [supabase])

  if (isLoading) {
    return <div>Loading your crops...</div>
  }

  return (
    <div className="space-y-6">
      <MSPAlertBanner />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Crops</h1>
          <p className="text-muted-foreground">Manage your crop listings and track bids</p>
        </div>
        <Link href="/dashboard/farmer/list">
          <Button>List New Crop</Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No crops listed yet. Start by listing your first crop!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardHeader>
                <CardTitle>{listing.crops?.name}</CardTitle>
                <CardDescription>
                  Quantity: {listing.quantity} {listing.crops?.unit}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Price per Unit</p>
                    <p className="text-lg font-semibold">₹{listing.price_per_unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-lg font-semibold">₹{listing.quantity * listing.price_per_unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-lg font-semibold capitalize">{listing.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

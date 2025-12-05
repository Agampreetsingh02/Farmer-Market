"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface Bid {
  id: string
  bid_amount: number
  status: string
  buyer_id: string
  crop_listings: {
    crops: { name: string }
    quantity: number
    price_per_unit: number
  }
  profiles: {
    full_name: string
    email: string
  }
}

export default function FarmerBids() {
  const [bids, setBids] = useState<Bid[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchBids = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from("bids")
        .select("*, crop_listings(crops(name), quantity, price_per_unit), profiles(full_name, email)")
        .eq("crop_listings.farmer_id", user.id)

      setBids(data || [])
      setIsLoading(false)
    }

    fetchBids()
  }, [supabase])

  const handleAcceptBid = async (bidId: string) => {
    await supabase.from("bids").update({ status: "accepted" }).eq("id", bidId)
    setBids(bids.map((bid) => (bid.id === bidId ? { ...bid, status: "accepted" } : bid)))
  }

  const handleRejectBid = async (bidId: string) => {
    await supabase.from("bids").update({ status: "rejected" }).eq("id", bidId)
    setBids(bids.map((bid) => (bid.id === bidId ? { ...bid, status: "rejected" } : bid)))
  }

  if (isLoading) {
    return <div>Loading bids...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bids on Your Crops</h1>
        <p className="text-muted-foreground">Review and accept offers from buyers</p>
      </div>

      {bids.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No bids yet on your crops.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <Card key={bid.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{bid.crop_listings?.crops?.name}</CardTitle>
                    <CardDescription>From: {bid.profiles?.full_name}</CardDescription>
                  </div>
                  <Badge
                    variant={
                      bid.status === "accepted" ? "default" : bid.status === "rejected" ? "destructive" : "outline"
                    }
                  >
                    {bid.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Price</p>
                    <p className="font-semibold">₹{bid.crop_listings?.price_per_unit}/unit</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bid Amount</p>
                    <p className="font-semibold">₹{bid.bid_amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-semibold">{bid.crop_listings?.quantity} units</p>
                  </div>
                </div>

                {bid.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAcceptBid(bid.id)}>
                      Accept Bid
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRejectBid(bid.id)}>
                      Reject Bid
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

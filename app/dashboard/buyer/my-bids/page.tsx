"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { PaymentButton } from "@/components/payment-button"

interface Bid {
  id: string
  bid_amount: number
  status: string
  crop_listing_id: string
  crop_listings: {
    crops: {
      name: string
    }
    quantity: number
    price_per_unit: number
    profiles: {
      full_name: string
    }
  }
}

export default function MyBids() {
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
        .select("*, crop_listings(*, crops(name), profiles(full_name))")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false })

      setBids(data || [])
      setIsLoading(false)
    }

    fetchBids()
  }, [supabase])

  const handleWithdrawBid = async (bidId: string) => {
    await supabase.from("bids").delete().eq("id", bidId)
    setBids(bids.filter((bid) => bid.id !== bidId))
  }

  if (isLoading) {
    return <div>Loading your bids...</div>
  }

  const acceptedBids = bids.filter((b) => b.status === "accepted")
  const pendingBids = bids.filter((b) => b.status === "pending")
  const rejectedBids = bids.filter((b) => b.status === "rejected")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Bids</h1>
        <p className="text-muted-foreground">Track and manage your offers</p>
      </div>

      {/* Accepted Bids */}
      {acceptedBids.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Badge>Accepted</Badge> {acceptedBids.length}
          </h2>
          <div className="space-y-4">
            {acceptedBids.map((bid) => (
              <Card key={bid.id} className="border-green-200 bg-green-50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{bid.crop_listings?.crops?.name}</CardTitle>
                      <CardDescription>from {bid.crop_listings?.profiles?.full_name}</CardDescription>
                    </div>
                    <Badge variant="default">Accepted</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Your Bid</p>
                      <p className="font-semibold">₹{bid.bid_amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quantity</p>
                      <p className="font-semibold">{bid.crop_listings?.quantity} units</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Farmer's Price</p>
                      <p className="font-semibold">₹{bid.crop_listings?.price_per_unit}/unit</p>
                    </div>
                  </div>
                  <PaymentButton
                    bidId={bid.id}
                    amount={bid.bid_amount}
                    cropName={bid.crop_listings?.crops?.name || "Crop"}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending Bids */}
      {pendingBids.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Badge variant="outline">Pending</Badge> {pendingBids.length}
          </h2>
          <div className="space-y-4">
            {pendingBids.map((bid) => (
              <Card key={bid.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{bid.crop_listings?.crops?.name}</CardTitle>
                      <CardDescription>from {bid.crop_listings?.profiles?.full_name}</CardDescription>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Your Bid</p>
                      <p className="font-semibold">₹{bid.bid_amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Farmer's Asking</p>
                      <p className="font-semibold">
                        ₹{bid.crop_listings?.quantity * bid.crop_listings?.price_per_unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Difference</p>
                      <p
                        className={`font-semibold ${
                          bid.bid_amount < bid.crop_listings?.quantity * bid.crop_listings?.price_per_unit
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        ₹{Math.abs(bid.bid_amount - bid.crop_listings?.quantity * bid.crop_listings?.price_per_unit)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 bg-transparent"
                    onClick={() => handleWithdrawBid(bid.id)}
                  >
                    Withdraw Bid
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Bids */}
      {rejectedBids.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Badge variant="destructive">Rejected</Badge> {rejectedBids.length}
          </h2>
          <div className="space-y-4">
            {rejectedBids.map((bid) => (
              <Card key={bid.id} className="opacity-60">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{bid.crop_listings?.crops?.name}</CardTitle>
                      <CardDescription>from {bid.crop_listings?.profiles?.full_name}</CardDescription>
                    </div>
                    <Badge variant="destructive">Rejected</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Your Bid</p>
                      <p className="font-semibold">₹{bid.bid_amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Farmer's Price</p>
                      <p className="font-semibold">₹{bid.crop_listings?.price_per_unit}/unit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {bids.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You haven't placed any bids yet. Browse crops and place your first bid!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

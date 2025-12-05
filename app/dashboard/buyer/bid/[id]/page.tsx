"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

interface CropListing {
  id: string
  quantity: number
  price_per_unit: number
  description: string
  crops: {
    name: string
    unit: string
  }
  profiles: {
    full_name: string
  }
}

export default function PlaceBid() {
  const [crop, setCrop] = useState<CropListing | null>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const cropId = params.id as string
  const supabase = createClient()

  useEffect(() => {
    const fetchCrop = async () => {
      const { data } = await supabase
        .from("crop_listings")
        .select("*, crops(name, unit), profiles(full_name)")
        .eq("id", cropId)
        .single()

      if (data) {
        setCrop(data)
        setBidAmount((data.price_per_unit * data.quantity).toString())
      }
      setIsLoading(false)
    }

    fetchCrop()
  }, [supabase, cropId])

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      if (!bidAmount || Number.parseFloat(bidAmount) <= 0) {
        throw new Error("Invalid bid amount")
      }

      const { error: insertError } = await supabase.from("bids").insert({
        crop_listing_id: cropId,
        buyer_id: user.id,
        bid_amount: Number.parseFloat(bidAmount),
        status: "pending",
      })

      if (insertError) throw insertError

      router.push("/dashboard/buyer/my-bids")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bid")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div>Loading crop details...</div>
  }

  if (!crop) {
    return <div>Crop not found</div>
  }

  const totalCropValue = crop.quantity * crop.price_per_unit

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Place Bid on {crop.crops?.name}</h1>
        <p className="text-muted-foreground">from {crop.profiles?.full_name}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Crop Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Crop Type</p>
              <p className="font-semibold">{crop.crops?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Quantity</p>
              <p className="font-semibold">
                {crop.quantity} {crop.crops?.unit}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Farmer's Price per Unit</p>
              <p className="font-semibold">₹{crop.price_per_unit}</p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Total Value (at farmer's price)</p>
              <p className="text-lg font-bold">₹{totalCropValue}</p>
            </div>
            {crop.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{crop.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Place Your Bid</CardTitle>
            <CardDescription>Submit your offer for this crop</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitBid} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="bidAmount">Your Bid Amount (₹)</Label>
                <Input
                  id="bidAmount"
                  type="number"
                  step="0.01"
                  placeholder="Enter your bid"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Farmer's asking price: ₹{totalCropValue}</p>
              </div>

              <div className="grid gap-2 pt-4 border-t">
                <p className="text-sm text-muted-foreground">Your Bid Summary</p>
                <div className="flex justify-between">
                  <span>Total Bid Amount:</span>
                  <span className="font-bold">₹{bidAmount || "0"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">vs Asking:</span>
                  <span
                    className={Number.parseFloat(bidAmount) < totalCropValue ? "text-green-600" : "text-orange-600"}
                  >
                    {Number.parseFloat(bidAmount) < totalCropValue ? "Lower" : "Higher"} by ₹
                    {Math.abs(Number.parseFloat(bidAmount) - totalCropValue)}
                  </span>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Placing Bid..." : "Place Bid"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

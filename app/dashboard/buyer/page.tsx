"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function BuyerDashboard() {
  const [crops, setCrops] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCrops = async () => {
      const { data } = await supabase
        .from("crop_listings")
        .select("*, crops(name, unit), profiles(full_name)")
        .eq("status", "available")

      setCrops(data || [])
      setIsLoading(false)
    }

    fetchCrops()
  }, [supabase])

  if (isLoading) {
    return <div>Loading available crops...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Crops</h1>
        <p className="text-muted-foreground">Find crops from local farmers</p>
      </div>

      {crops.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No crops available at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crops.map((crop) => (
            <Card key={crop.id}>
              <CardHeader>
                <CardTitle>{crop.crops?.name}</CardTitle>
                <CardDescription>by {crop.profiles?.full_name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-semibold">
                      {crop.quantity} {crop.crops?.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price/Unit</p>
                    <p className="font-semibold">₹{crop.price_per_unit}</p>
                  </div>
                </div>
                <Button className="w-full">Place Bid</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

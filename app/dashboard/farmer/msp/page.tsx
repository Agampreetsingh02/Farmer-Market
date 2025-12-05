"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface MSPPrice {
  id: string
  crop_id: string
  season: string
  msp_price: number
  crops: {
    name: string
  }
}

export default function FarmerMSP() {
  const [mspPrices, setMspPrices] = useState<MSPPrice[]>([])
  const [farmerCrops, setFarmerCrops] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const [mspRes, cropsRes] = await Promise.all([
        supabase.from("msp_prices").select("*, crops(name)"),
        supabase.from("crop_listings").select("*, crops(name)").eq("farmer_id", user.id).eq("status", "available"),
      ])

      setMspPrices(mspRes.data || [])
      setFarmerCrops(cropsRes.data || [])
      setIsLoading(false)
    }

    fetchData()
  }, [supabase])

  if (isLoading) {
    return <div>Loading MSP data...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">MSP Prices</h1>
        <p className="text-muted-foreground">Government Minimum Support Prices for crops</p>
      </div>

      {farmerCrops.length > 0 && (
        <>
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Listed Crops vs MSP</h2>
            <div className="grid gap-4">
              {farmerCrops.map((listing) => {
                const mspPrice = mspPrices.find((m) => m.crop_id === listing.crop_id)
                const isAboveMSP = listing.price_per_unit >= (mspPrice?.msp_price || 0)

                return (
                  <Card key={listing.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle>{listing.crops?.name}</CardTitle>
                        <Badge variant={isAboveMSP ? "default" : "destructive"}>
                          {isAboveMSP ? "Above MSP" : "Below MSP"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Your Price</p>
                          <p className="text-lg font-semibold">₹{listing.price_per_unit}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">MSP Price</p>
                          <p className="text-lg font-semibold">₹{mspPrice?.msp_price || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Difference</p>
                          <p className={`text-lg font-semibold ${isAboveMSP ? "text-green-600" : "text-red-600"}`}>
                            ₹{Math.abs(listing.price_per_unit - (mspPrice?.msp_price || 0))}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">All MSP Prices</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {mspPrices.map((price) => (
            <Card key={price.id}>
              <CardHeader>
                <CardTitle className="text-lg">{price.crops?.name}</CardTitle>
                <CardDescription>{price.season}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₹{price.msp_price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

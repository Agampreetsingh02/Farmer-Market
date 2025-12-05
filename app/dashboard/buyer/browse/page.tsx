"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface CropListing {
  id: string
  crop_id: string
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

export default function BrowseCrops() {
  const [crops, setCrops] = useState<CropListing[]>([])
  const [filteredCrops, setFilteredCrops] = useState<CropListing[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCrops = async () => {
      const { data } = await supabase
        .from("crop_listings")
        .select("*, crops(name, unit), profiles(full_name)")
        .eq("status", "available")

      setCrops(data || [])
      setFilteredCrops(data || [])
      setIsLoading(false)
    }

    fetchCrops()
  }, [supabase])

  useEffect(() => {
    const filtered = crops.filter(
      (crop) =>
        crop.crops?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredCrops(filtered)
  }, [searchTerm, crops])

  if (isLoading) {
    return <div>Loading crops...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Available Crops</h1>
        <p className="text-muted-foreground">Find and bid on fresh crops from local farmers</p>
      </div>

      <div className="max-w-xs">
        <Input
          placeholder="Search by crop name or farmer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCrops.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {crops.length === 0 ? "No crops available at the moment." : "No crops match your search."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrops.map((crop) => (
            <Card key={crop.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{crop.crops?.name}</CardTitle>
                <CardDescription>by {crop.profiles?.full_name}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-semibold">
                      {crop.quantity} {crop.crops?.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price/Unit</p>
                    <p className="font-semibold">₹{crop.price_per_unit}</p>
                  </div>
                </div>

                {crop.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Details</p>
                    <p className="text-sm">{crop.description}</p>
                  </div>
                )}

                <div className="pt-4 flex gap-2">
                  <Link href={`/dashboard/buyer/bid/${crop.id}`} className="flex-1">
                    <Button className="w-full">Place Bid</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

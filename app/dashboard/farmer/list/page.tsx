"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface Crop {
  id: string
  name: string
  unit: string
}

export default function ListCrop() {
  const [crops, setCrops] = useState<Crop[]>([])
  const [formData, setFormData] = useState({
    crop_id: "",
    quantity: "",
    price_per_unit: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCrops = async () => {
      const { data } = await supabase.from("crops").select("id, name, unit")
      setCrops(data || [])
    }
    fetchCrops()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error: insertError } = await supabase.from("crop_listings").insert({
        farmer_id: user.id,
        crop_id: formData.crop_id,
        quantity: Number.parseFloat(formData.quantity),
        price_per_unit: Number.parseFloat(formData.price_per_unit),
        description: formData.description,
        status: "available",
      })

      if (insertError) throw insertError

      router.push("/dashboard/farmer")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to list crop")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">List New Crop</h1>
        <p className="text-muted-foreground">Add your crop to the marketplace</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crop Details</CardTitle>
          <CardDescription>Provide information about your crop</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="crop">Select Crop</Label>
              <Select value={formData.crop_id} onValueChange={(value) => setFormData({ ...formData, crop_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a crop" />
                </SelectTrigger>
                <SelectContent>
                  {crops.map((crop) => (
                    <SelectItem key={crop.id} value={crop.id}>
                      {crop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price per Unit (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="Enter price per unit"
                value={formData.price_per_unit}
                onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Quality, variety, or other details"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Listing..." : "List Crop"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface GovProcurementOption {
  crop_name: string
  msp_price: number
  procurement_agency: string
  contact: string
  process_description: string
}

export default function GovernmentProcurement() {
  const [farmerListings, setFarmerListings] = useState<any[]>([])
  const [govOptions, setGovOptions] = useState<GovProcurementOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: listings } = await supabase
        .from("crop_listings")
        .select("*, crops(name), msp_prices!inner(msp_price)")
        .eq("farmer_id", user.id)
        .eq("status", "available")

      setFarmerListings(listings || [])

      const options: GovProcurementOption[] = [
        {
          crop_name: "Wheat",
          msp_price: 2125,
          procurement_agency: "FCI (Food Corporation of India)",
          contact: "1800-180-1551",
          process_description:
            "Register with your nearest FCI center. Direct procurement at MSP. Minimum 500 kg per lot.",
        },
        {
          crop_name: "Rice",
          msp_price: 2100,
          procurement_agency: "State Warehousing Corporations",
          contact: "Contact State Government",
          process_description:
            "Government fair price shops and procurement centers. MSP guarantee with transparent pricing.",
        },
        {
          crop_name: "Cotton",
          msp_price: 5515,
          procurement_agency: "Cotton Corporation of India",
          contact: "www.cotcorp.gov.in",
          process_description: "Competitive bidding for quality cotton. MSP floor price protection.",
        },
      ]

      setGovOptions(options)
      setIsLoading(false)
    }

    fetchData()
  }, [supabase])

  if (isLoading) {
    return <div>Loading procurement options...</div>
  }

  const belowMSPListings = farmerListings.filter(
    (listing) => listing.price_per_unit < (listing.msp_prices?.[0]?.msp_price || 0),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Government MSP Procurement</h1>
        <p className="text-muted-foreground">Sell directly to government agencies at guaranteed MSP</p>
      </div>

      {belowMSPListings.length > 0 && (
        <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
          <h3 className="font-semibold text-blue-900">Improvement Opportunity</h3>
          <p className="text-sm text-blue-800">
            {belowMSPListings.length} of your listings are priced below MSP. Consider government procurement for
            guaranteed price protection.
          </p>
        </div>
      )}

      <div className="grid gap-6">
        {govOptions.map((option, idx) => (
          <Card key={idx}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{option.crop_name}</CardTitle>
                  <CardDescription>{option.procurement_agency}</CardDescription>
                </div>
                <Badge variant="default" className="bg-green-600">
                  MSP ₹{option.msp_price}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Process</p>
                <p className="text-sm">{option.process_description}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Contact</p>
                <p className="text-sm font-semibold">{option.contact}</p>
              </div>
              <Button className="w-full">Get More Information</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

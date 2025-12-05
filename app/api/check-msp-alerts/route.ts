import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    },
  )

  try {
    const { data: listings } = await supabase
      .from("crop_listings")
      .select("*, crops(id), msp_prices!inner(msp_price)")
      .eq("status", "available")

    if (listings) {
      for (const listing of listings) {
        const mspPrice = listing.msp_prices?.[0]?.msp_price

        if (mspPrice && listing.price_per_unit < mspPrice) {
          // Check if alert already exists
          const { data: existingAlert } = await supabase
            .from("user_alerts")
            .select("id")
            .eq("user_id", listing.farmer_id)
            .eq("crop_listing_id", listing.id)
            .eq("alert_type", "below_msp")
            .single()

          if (!existingAlert) {
            await supabase.from("user_alerts").insert({
              user_id: listing.farmer_id,
              crop_listing_id: listing.id,
              alert_type: "below_msp",
              message: `Your ${listing.crops?.id} listing is priced below MSP. Current MSP: ₹${mspPrice}`,
              is_read: false,
            })
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("MSP check error:", error)
    return NextResponse.json({ error: "Failed to check MSP prices" }, { status: 500 })
  }
}

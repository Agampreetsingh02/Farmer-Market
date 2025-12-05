import Stripe from "stripe"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return Response.json({ error: "Invalid signature" }, { status: 400 })
  }

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
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const { bidId } = session.metadata as { bidId: string }

      const { error } = await supabase
        .from("bids")
        .update({ status: "completed", paid_at: new Date().toISOString() })
        .eq("id", bidId)

      if (error) {
        console.error("Failed to update bid:", error)
        return Response.json({ error: "Failed to update bid" }, { status: 500 })
      }

      const { data: bid } = await supabase.from("bids").select("*").eq("id", bidId).single()

      if (bid) {
        await supabase.from("transactions").insert({
          bid_id: bidId,
          farmer_id: bid.farmer_id,
          buyer_id: bid.buyer_id,
          amount: session.amount_total! / 100,
          status: "completed",
          payment_method: "stripe",
          transaction_date: new Date().toISOString(),
        })
      }
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return Response.json({ error: "Processing failed" }, { status: 500 })
  }
}

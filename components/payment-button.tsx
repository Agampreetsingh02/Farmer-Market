"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"

interface PaymentButtonProps {
  bidId: string
  amount: number
  cropName: string
}

export function PaymentButton({ bidId, amount, cropName }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        throw new Error("Stripe configuration is missing. Please check environment variables.")
      }

      // Create checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidId, amount, cropName }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create checkout session")
      }

      const { sessionId } = await response.json()

      const { loadStripe } = await import("@stripe/stripe-js")
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

      if (!stripe) {
        throw new Error("Stripe failed to initialize")
      }

      // Redirect to checkout
      const { error: stripeError } = await stripe?.redirectToCheckout({ sessionId })

      if (stripeError) {
        throw new Error(stripeError.message || "Checkout failed")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment failed"
      console.error("[v0] Payment error:", errorMessage)
      setError(errorMessage)
      setLoading(false)
    }
  }, [bidId, amount, cropName])

  return (
    <div className="space-y-2">
      <Button onClick={handlePayment} disabled={loading} className="w-full" size="lg">
        {loading ? "Processing..." : `Pay ₹${amount.toLocaleString()}`}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface UserAlert {
  id: string
  alert_type: string
  message: string
  is_read: boolean
}

export function MSPAlertBanner() {
  const [alerts, setAlerts] = useState<UserAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchAlerts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from("user_alerts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_read", false)
        .eq("alert_type", "below_msp")

      setAlerts(data || [])
      setIsLoading(false)
    }

    fetchAlerts()
  }, [supabase])

  const handleDismiss = async (alertId: string) => {
    await supabase.from("user_alerts").update({ is_read: true }).eq("id", alertId)
    setAlerts(alerts.filter((a) => a.id !== alertId))
  }

  if (isLoading || alerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-2 mb-6">
      {alerts.map((alert) => (
        <Alert key={alert.id} className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900">Price Below MSP</AlertTitle>
          <AlertDescription className="text-orange-800">{alert.message}</AlertDescription>
          <Button size="sm" variant="ghost" onClick={() => handleDismiss(alert.id)} className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      ))}
    </div>
  )
}

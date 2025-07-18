"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Heart, ArrowRight } from "lucide-react"
import confetti from "canvas-confetti"
import { useEffect } from "react"

export function SuccessMessage({ formData, onReset }) {
  // Trigger confetti effect when component mounts
  useEffect(() => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // Green and emerald confetti
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#10B981", "#34D399", "#6EE7B7"],
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#10B981", "#34D399", "#6EE7B7"],
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-md shadow-xl border border-green-200/50 rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-green-50/30 to-emerald-50/30 rounded-3xl"></div>

      <CardHeader className="text-center relative z-10 pb-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-semibold text-green-800">Thank You for Your Donation!</CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        <div className="text-center text-green-700 space-y-2">
          <p>
            Your {formData.donationType === "monetary" ? "monetary donation" : "item donation"} to{" "}
            <span className="font-semibold">{formData.orphanageName}</span> has been successfully submitted.
          </p>
          <p>
            We've sent a confirmation email to <span className="font-semibold">{formData.donorEmail}</span> with all the
            details.
          </p>
        </div>

        <div className="bg-green-50/70 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-medium text-green-800 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Your Impact
          </h3>
          <p className="text-green-700">
            Your generosity will make a real difference in the lives of children at {formData.orphanageName}. Thank you
            for your compassion and support.
          </p>

          {formData.donationType === "monetary" && (
            <div className="bg-white/70 rounded-xl p-4 text-center">
              <span className="text-2xl font-bold text-green-700">
                ${Number.parseFloat(formData.monetaryAmount).toFixed(2)}
              </span>
              <p className="text-sm text-green-600 mt-1">will help provide essential resources for children in need</p>
            </div>
          )}

          {formData.donationType === "items" && (
            <div className="bg-white/70 rounded-xl p-4">
              <p className="text-green-700">
                Your donation of <span className="font-medium">{formData.itemDescription}</span> will be put to good use
                right away.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4">
          <p className="text-center text-green-600 text-sm">
            A member of our team will contact you soon with next steps.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onReset}
              className="bg-gradient-to-r from-green-500/90 to-emerald-500/90 hover:from-green-600/90 hover:to-emerald-600/90 text-white rounded-xl"
            >
              Make Another Donation
            </Button>
            <Button
              variant="outline"
              className="border border-green-200/60 hover:border-green-400/60 hover:bg-green-50/50 text-green-700 rounded-xl"
              onClick={() => (window.location.href = "/")}
            >
              Return to Homepage
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

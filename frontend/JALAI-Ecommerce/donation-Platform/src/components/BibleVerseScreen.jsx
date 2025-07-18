import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Quote, Heart } from 'lucide-react'

function BibleVerseScreen() {
  const navigate = useNavigate()
  const [fadeOut, setFadeOut] = useState(false)

  const handleContinue = () => {
    setFadeOut(true)
    setTimeout(() => {
      navigate('/dashboard')
    }, 600)
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden transition-opacity duration-600 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background Image with Blur Effect */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm opacity-30"
        style={{
          backgroundImage: `url('/assets/orphanage-default2.jpg')`,
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-emerald-900/10 to-teal-900/20" />

      {/* Content */}
      <Card className="relative z-10 w-full max-w-2xl shadow-2xl border border-white/50 bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-1000">
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-green-50/30 to-emerald-50/30 rounded-3xl" />

        <CardContent className="relative z-10 p-12 text-center space-y-8">
          {/* Quote Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400/30 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-green-100 p-6 rounded-full">
                <Quote className="h-12 w-12 text-green-600" />
              </div>
            </div>
          </div>

          {/* Bible Verse */}
          <blockquote className="text-2xl md:text-3xl font-light text-green-800 leading-relaxed italic">
            "Whoever is generous to the poor lends to the Lord, and he will repay him for his deed."
          </blockquote>

          {/* Reference */}
          <p className="text-lg text-green-600 font-medium">— Proverbs 19:17</p>

          {/* Decorative Elements */}
          <div className="flex justify-center space-x-4 py-4">
            <Heart className="h-6 w-6 text-green-400 animate-pulse" />
            <Heart className="h-6 w-6 text-emerald-400 animate-pulse delay-200" />
            <Heart className="h-6 w-6 text-teal-400 animate-pulse delay-400" />
          </div>

          {/* Continue Button */}
          <div className="pt-4">
            <Button
              onClick={handleContinue}
              className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 text-lg font-medium rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Continue to Donate
            </Button>
          </div>

          {/* Inspirational Message */}
          <div className="pt-6 border-t border-green-200/40">
            <p className="text-sm text-green-600 leading-relaxed">
              Your generosity brings hope and transforms lives. Thank you for being part of our mission to care for orphaned children.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-green-100/30 to-emerald-100/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-emerald-100/30 to-teal-100/30 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-r from-teal-100/30 to-green-100/30 rounded-full blur-3xl animate-pulse delay-500" />
    </div>
  )
}

export default BibleVerseScreen

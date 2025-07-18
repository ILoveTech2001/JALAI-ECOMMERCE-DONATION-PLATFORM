import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Heart, Home, Mail, Phone } from "lucide-react"

export function SuccessMessage({ formData, onReset }) {
  return (
    <Card className="w-full max-w-2xl shadow-2xl border border-white/50 bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-green-50/30 to-emerald-50/30 rounded-3xl"></div>
      
      <CardHeader className="text-center pb-6 relative z-10">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative bg-green-100 p-6 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
        </div>
        
        <CardTitle className="text-3xl font-light text-green-800 mb-4">
          Donation Submitted Successfully!
        </CardTitle>
        
        <p className="text-green-600 text-lg leading-relaxed">
          Thank you for your generous contribution to {formData.orphanageName}. 
          Your kindness will make a real difference in children's lives.
        </p>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {/* Donation Summary */}
        <div className="bg-green-50/50 rounded-2xl p-6">
          <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-green-500" />
            Your Donation Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-green-600 font-medium">Donor:</p>
              <p className="text-green-800">{formData.donorName}</p>
            </div>
            
            <div>
              <p className="text-green-600 font-medium">Beneficiary:</p>
              <p className="text-green-800">{formData.orphanageName}</p>
            </div>
            
            <div>
              <p className="text-green-600 font-medium">Donation Type:</p>
              <p className="text-green-800">
                {formData.donationType === "monetary" 
                  ? `${parseInt(formData.monetaryAmount || 0).toLocaleString()} CFA Francs`
                  : `${formData.itemCategory} - ${formData.itemDescription}`
                }
              </p>
            </div>
            
            <div>
              <p className="text-green-600 font-medium">Reference ID:</p>
              <p className="text-green-800 font-mono">
                JALAI-{Date.now().toString().slice(-8)}
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50/50 rounded-2xl p-6">
          <h3 className="font-semibold text-green-800 mb-4">What Happens Next?</h3>
          
          <div className="space-y-3 text-sm text-green-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-800">1</span>
              </div>
              <p>You will receive a confirmation email within 24 hours with detailed instructions.</p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-800">2</span>
              </div>
              <p>Our team will coordinate with the orphanage to arrange the donation transfer.</p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-800">3</span>
              </div>
              <p>You'll receive updates on how your donation is making an impact.</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-emerald-50/50 rounded-2xl p-6">
          <h3 className="font-semibold text-green-800 mb-4">Need Help?</h3>
          
          <div className="space-y-2 text-sm text-green-700">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-green-500" />
              <span>support@jalai.org</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-500" />
              <span>+237 6XX XXX XXX</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            onClick={onReset}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl"
          >
            <Heart className="h-4 w-4 mr-2" />
            Make Another Donation
          </Button>
          
          <Button
            variant="outline"
            className="flex-1 border-green-200 text-green-700 hover:bg-green-50 py-3 rounded-2xl"
            onClick={() => window.location.href = '/'}
          >
            <Home className="h-4 w-4 mr-2" />
            Return to Home
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

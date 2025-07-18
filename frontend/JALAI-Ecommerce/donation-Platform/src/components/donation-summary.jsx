import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, MapPin, Package, DollarSign, Calendar, Clock, Truck } from "lucide-react"

export function DonationSummary({ formData }) {
  const {
    donorName,
    orphanageName,
    location,
    donationType,
    monetaryAmount,
    itemCategory,
    itemDescription,
    itemQuantity,
    itemCondition,
    urgencyLevel,
    deliveryMethod,
    preferredDate,
    message,
  } = formData

  if (!donorName && !orphanageName) return null

  // Format the date if it exists
  const formattedDate = preferredDate
    ? new Date(preferredDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  // Map urgency levels to readable text
  const urgencyText = {
    low: "Low - No rush",
    medium: "Medium - Within a month",
    high: "High - Within a week",
    urgent: "Urgent - ASAP",
  }

  // Map delivery methods to readable text
  const deliveryText = {
    pickup: "Donor will arrange pickup",
    delivery: "Donor will deliver personally",
    shipping: "Ship via courier",
    "jalai-pickup": "JALAI pickup service",
  }

  // Map item categories to readable text
  const categoryText = {
    clothing: "Clothing & Shoes",
    toys: "Toys & Games",
    books: "Books & Educational Materials",
    food: "Food & Nutrition",
    medical: "Medical Supplies",
    electronics: "Electronics",
    furniture: "Furniture",
    other: "Other",
  }

  return (
    <Card className="sticky top-4 shadow-xl border border-white/50 bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-green-50/30 to-emerald-50/30 rounded-3xl"></div>
      
      <CardHeader className="relative z-10 pb-4">
        <CardTitle className="text-xl font-light text-green-800 flex items-center gap-2">
          <Heart className="h-5 w-5 text-green-500" />
          Donation Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {/* Donor Information */}
        {donorName && (
          <div className="p-4 bg-green-50/50 rounded-2xl">
            <h4 className="font-medium text-green-800 mb-2">Donor</h4>
            <p className="text-sm text-green-700">{donorName}</p>
          </div>
        )}

        {/* Orphanage Information */}
        {orphanageName && (
          <div className="p-4 bg-blue-50/50 rounded-2xl">
            <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-500" />
              Beneficiary
            </h4>
            <p className="text-sm text-green-700 font-medium">{orphanageName}</p>
            {location && (
              <p className="text-xs text-green-600 mt-1">
                {location.charAt(0).toUpperCase() + location.slice(1)}
              </p>
            )}
          </div>
        )}

        {/* Donation Details */}
        {donationType && (
          <div className="p-4 bg-emerald-50/50 rounded-2xl">
            <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
              {donationType === "monetary" ? (
                <DollarSign className="h-4 w-4 text-green-500" />
              ) : (
                <Package className="h-4 w-4 text-green-500" />
              )}
              Donation Type
            </h4>
            
            {donationType === "monetary" && monetaryAmount && (
              <p className="text-sm text-green-700 font-medium">
                {parseInt(monetaryAmount).toLocaleString()} CFA Francs
              </p>
            )}
            
            {donationType === "items" && (
              <div className="space-y-1">
                {itemCategory && (
                  <p className="text-sm text-green-700 font-medium">
                    {categoryText[itemCategory] || itemCategory}
                  </p>
                )}
                {itemDescription && (
                  <p className="text-xs text-green-600">{itemDescription}</p>
                )}
                {itemQuantity && (
                  <p className="text-xs text-green-600">Quantity: {itemQuantity}</p>
                )}
                {itemCondition && (
                  <p className="text-xs text-green-600">
                    Condition: {itemCondition.charAt(0).toUpperCase() + itemCondition.slice(1)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Additional Information */}
        {(urgencyLevel || deliveryMethod || preferredDate) && (
          <div className="p-4 bg-teal-50/50 rounded-2xl">
            <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              Additional Details
            </h4>
            <div className="space-y-1">
              {urgencyLevel && (
                <p className="text-xs text-green-600">
                  <strong>Urgency:</strong> {urgencyText[urgencyLevel] || urgencyLevel}
                </p>
              )}
              {deliveryMethod && (
                <p className="text-xs text-green-600">
                  <strong>Delivery:</strong> {deliveryText[deliveryMethod] || deliveryMethod}
                </p>
              )}
              {formattedDate && (
                <p className="text-xs text-green-600">
                  <strong>Preferred Date:</strong> {formattedDate}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className="p-4 bg-yellow-50/50 rounded-2xl">
            <h4 className="font-medium text-green-800 mb-2">Message</h4>
            <p className="text-xs text-green-600 italic">"{message}"</p>
          </div>
        )}

        {/* Completion indicator */}
        <div className="text-center pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100/50 rounded-full">
            <Heart className="h-4 w-4 text-green-500" />
            <span className="text-xs font-medium text-green-700">
              Thank you for your generosity!
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

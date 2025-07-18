"use client"

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
    other: "Other Items",
  }

  return (
    <Card className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm border border-green-200/40 rounded-2xl shadow-lg animate-in slide-in-from-right-5 duration-1000">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Donation Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {donorName && (
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-green-700">
              <strong>Donor:</strong> {donorName}
            </span>
          </div>
        )}

        {orphanageName && (
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span className="text-sm text-green-700">
              <strong>Orphanage:</strong> {orphanageName}
            </span>
          </div>
        )}

        {location && (
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-700">
              <strong>Location:</strong> {location}
            </span>
          </div>
        )}

        {donationType && (
          <div className="flex items-center gap-3">
            {donationType === "monetary" ? (
              <DollarSign className="h-4 w-4 text-green-500" />
            ) : (
              <Package className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm text-green-700">
              <strong>Type:</strong> {donationType === "monetary" ? "Monetary Donation" : "Item Donation"}
            </span>
          </div>
        )}

        {donationType === "monetary" && monetaryAmount && (
          <div className="bg-green-100/50 rounded-xl p-3">
            <span className="text-lg font-semibold text-green-800">
              ${Number.parseFloat(monetaryAmount).toFixed(2)}
            </span>
          </div>
        )}

        {donationType === "items" && (
          <div className="bg-emerald-100/50 rounded-xl p-3 space-y-2">
            {itemCategory && (
              <span className="text-sm text-green-700 block">
                <strong>Category:</strong> {categoryText[itemCategory] || itemCategory}
              </span>
            )}
            {itemDescription && (
              <span className="text-sm text-green-700 block">
                <strong>Description:</strong> {itemDescription}
              </span>
            )}
            {itemQuantity && (
              <span className="text-sm text-green-700 block">
                <strong>Quantity:</strong> {itemQuantity}
              </span>
            )}
            {itemCondition && (
              <span className="text-sm text-green-700 block">
                <strong>Condition:</strong> {itemCondition}
              </span>
            )}
          </div>
        )}

        <div className="space-y-2 pt-2">
          {urgencyLevel && (
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-green-700">
                <strong>Urgency:</strong> {urgencyText[urgencyLevel] || urgencyLevel}
              </span>
            </div>
          )}

          {deliveryMethod && (
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-green-700">
                <strong>Delivery:</strong> {deliveryText[deliveryMethod] || deliveryMethod}
              </span>
            </div>
          )}

          {formattedDate && (
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-green-700">
                <strong>Date:</strong> {formattedDate}
              </span>
            </div>
          )}
        </div>

        {message && (
          <div className="bg-teal-100/50 rounded-xl p-3 mt-2">
            <span className="text-sm text-green-700">
              <strong>Message:</strong> {message.substring(0, 100)}
              {message.length > 100 ? "..." : ""}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

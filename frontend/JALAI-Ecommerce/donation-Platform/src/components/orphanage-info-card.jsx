import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Users, Calendar, Phone, Mail, Star } from "lucide-react"

export function OrphanageInfoCard({ orphanage }) {
  if (!orphanage) return null

  return (
    <Card className="border border-green-200/60 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with name and rating */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-green-800 text-lg">{orphanage.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(orphanage.rating || 5)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-sm text-green-600 ml-1">
                  ({orphanage.rating || 5.0})
                </span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-green-700">
            <MapPin className="h-4 w-4 text-green-500" />
            <span>{orphanage.address}</span>
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-green-600">Children</p>
                <p className="font-medium text-green-800">{orphanage.children_count}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-green-600">Established</p>
                <p className="font-medium text-green-800">{orphanage.established}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {orphanage.description && (
            <div className="bg-green-50/50 rounded-xl p-4">
              <p className="text-sm text-green-700 leading-relaxed">
                {orphanage.description}
              </p>
            </div>
          )}

          {/* Current Needs */}
          {orphanage.current_needs && orphanage.current_needs.length > 0 && (
            <div>
              <h4 className="font-medium text-green-800 mb-2">Current Needs</h4>
              <div className="flex flex-wrap gap-2">
                {orphanage.current_needs.slice(0, 3).map((need, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100/60 text-blue-700 text-xs rounded-full"
                  >
                    {need}
                  </span>
                ))}
                {orphanage.current_needs.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100/60 text-gray-600 text-xs rounded-full">
                    +{orphanage.current_needs.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="border-t border-green-200/40 pt-4">
            <h4 className="font-medium text-green-800 mb-2">Contact Information</h4>
            <div className="space-y-1 text-sm">
              {orphanage.contact?.phone && (
                <div className="flex items-center gap-2 text-green-700">
                  <Phone className="h-3 w-3 text-green-500" />
                  <span>{orphanage.contact.phone}</span>
                </div>
              )}
              {orphanage.contact?.email && (
                <div className="flex items-center gap-2 text-green-700">
                  <Mail className="h-3 w-3 text-green-500" />
                  <span>{orphanage.contact.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="bg-emerald-50/50 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-700">Verified Organization</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-700">Regular Updates</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

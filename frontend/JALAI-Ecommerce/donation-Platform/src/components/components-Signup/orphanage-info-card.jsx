"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Users, Calendar, Phone, User } from "lucide-react"

export function OrphanageInfoCard({ orphanage }) {
  if (!orphanage) return null

  return (
    <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/40 rounded-2xl shadow-lg animate-in slide-in-from-top-5 duration-500">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-blue-800 text-sm leading-tight">{orphanage.name}</h4>
          <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{orphanage.capacity} capacity</div>
        </div>

        <div className="space-y-2 text-xs text-blue-700">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-blue-500 flex-shrink-0" />
            <span>{orphanage.address}</span>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-blue-500 flex-shrink-0" />
            <span>{orphanage.contact}</span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-blue-500 flex-shrink-0" />
            <span>{orphanage.phone}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-blue-500 flex-shrink-0" />
            <span>Ages: {orphanage.ageRange}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-blue-500 flex-shrink-0" />
            <span>{orphanage.specialization}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

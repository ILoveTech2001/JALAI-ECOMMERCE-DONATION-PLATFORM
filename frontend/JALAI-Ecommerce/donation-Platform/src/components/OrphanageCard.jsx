import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Users, Calendar, ArrowRight, Heart } from 'lucide-react'

function OrphanageCard({ orphanage }) {
  return (
    <Card className="group shadow-lg border border-white/50 bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={orphanage.image || '/assets/orphanage-default.jpg'}
          alt={orphanage.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Floating Heart Icon */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Heart className="h-4 w-4 text-green-500" />
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Title */}
        <h3 className="text-xl font-semibold text-green-800 group-hover:text-green-600 transition-colors duration-300">
          {orphanage.name}
        </h3>

        {/* Location */}
        {orphanage.location && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <MapPin className="h-4 w-4 text-green-500" />
            <span>{orphanage.location}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-green-600">
          {orphanage.children_count && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-green-500" />
              <span>{orphanage.children_count} children</span>
            </div>
          )}
          {orphanage.established && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-green-500" />
              <span>Est. {orphanage.established}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-green-700 text-sm leading-relaxed line-clamp-3">
          {orphanage.description}
        </p>

        {/* Current Needs */}
        {orphanage.current_needs && orphanage.current_needs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-green-600">Current Needs:</p>
            <div className="flex flex-wrap gap-1">
              {orphanage.current_needs.slice(0, 2).map((need, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100/60 text-blue-700 text-xs rounded-full"
                >
                  {need}
                </span>
              ))}
              {orphanage.current_needs.length > 2 && (
                <span className="px-2 py-1 bg-gray-100/60 text-gray-600 text-xs rounded-full">
                  +{orphanage.current_needs.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link to={`/orphanage/${orphanage.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 rounded-xl transition-all duration-300 group/btn"
            >
              <span>View Details</span>
              <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Button>
          </Link>
          
          <Link to={`/donate?orphanage=${orphanage.id}`}>
            <Button className="bg-green-600 hover:bg-green-700 text-white px-6 rounded-xl transition-all duration-300 transform hover:scale-105">
              <Heart className="h-4 w-4 mr-2" />
              Donate
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrphanageCard

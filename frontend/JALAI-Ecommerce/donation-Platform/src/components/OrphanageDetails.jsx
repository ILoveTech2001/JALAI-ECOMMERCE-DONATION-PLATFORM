import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Phone,
  Mail,
  Heart,
  Star,
  MessageCircle,
  Share2,
  Instagram,
  Youtube,
  Facebook,
  Building2,
  CheckCircle,
  Clock
} from 'lucide-react'
import apiService from '@/services/apiService'

function OrphanageDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [orphanage, setOrphanage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrphanageDetails()
  }, [id])

  const fetchOrphanageDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getOrphanage(id)
      setOrphanage(response)
      if (response) {
        document.title = `${response.name} - JALAI`
      }
    } catch (error) {
      console.error('Error fetching orphanage details:', error)
      setError('Failed to load orphanage details. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border border-white/50 bg-white/90 backdrop-blur-md rounded-3xl">
          <CardContent className="p-12 text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-green-800">Loading...</h2>
            <p className="text-green-600">Please wait while we fetch the orphanage details.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !orphanage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border border-white/50 bg-white/90 backdrop-blur-md rounded-3xl">
          <CardContent className="p-12 text-center space-y-4">
            <h2 className="text-2xl font-semibold text-green-800">
              {error ? 'Error Loading Orphanage' : 'Orphanage Not Found'}
            </h2>
            <p className="text-green-600">
              {error || "The orphanage you're looking for doesn't exist."}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-green-600 hover:bg-green-700 text-white rounded-2xl"
              >
                Back to Dashboard
              </Button>
              {error && (
                <Button
                  onClick={fetchOrphanageDetails}
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50 rounded-2xl"
                >
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-green-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-green-700 hover:text-green-800 hover:bg-green-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={() => navigate(`/donate?orphanage=${orphanage.id}`)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Heart className="h-4 w-4 mr-2" />
                Donate Item
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image and Basic Info */}
            <Card className="shadow-xl border border-white/50 bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden">
              <div className="relative">
                <img
                  src={orphanage.imageUrl || orphanage.image || '/assets/orphanage-default.jpg'}
                  alt={orphanage.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h1 className="text-3xl font-bold mb-2">{orphanage.name}</h1>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{orphanage.location || orphanage.address}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                  {orphanage.isActive || orphanage.status === 'approved' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-800">Active</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-800">Pending</span>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="shadow-lg border border-white/50 bg-white/90 backdrop-blur-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-green-800">About This Orphanage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 leading-relaxed">
                  {orphanage.description ||
                   orphanage.specialization ||
                   "Helping children grow in love and faith, providing them with care, education, and hope for a better future."}
                </p>
                {orphanage.specialization && orphanage.description !== orphanage.specialization && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-green-800 mb-2">Specialization:</h4>
                    <p className="text-green-700">{orphanage.specialization}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Needs */}
            {orphanage.current_needs && orphanage.current_needs.length > 0 && (
              <Card className="shadow-lg border border-white/50 bg-white/90 backdrop-blur-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-green-800">Current Needs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {orphanage.current_needs.map((need, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                        {need}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="shadow-lg border border-white/50 bg-white/90 backdrop-blur-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-green-800">Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-green-700">Capacity</span>
                  </div>
                  <span className="font-semibold text-green-800">
                    {orphanage.capacity || orphanage.approximateChildren || orphanage.numberOfChildren || 'N/A'}
                  </span>
                </div>

                {orphanage.ageRange && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-green-700">Age Range</span>
                    </div>
                    <span className="font-semibold text-green-800">{orphanage.ageRange}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-green-500" />
                    <span className="text-green-700">Status</span>
                  </div>
                  <Badge className={`${
                    orphanage.isActive || orphanage.status === 'approved'
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                  }`}>
                    {orphanage.isActive || orphanage.status === 'approved' ? 'Active' : 'Pending'}
                  </Badge>
                </div>

                {orphanage.createdAt && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-green-700">Registered</span>
                    </div>
                    <span className="font-semibold text-green-800">
                      {new Date(orphanage.createdAt).getFullYear()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-lg border border-white/50 bg-white/90 backdrop-blur-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-green-800">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(orphanage.phoneNumber || orphanage.phone) && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span className="text-green-700">{orphanage.phoneNumber || orphanage.phone}</span>
                  </div>
                )}

                {orphanage.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-green-500" />
                    <span className="text-green-700">{orphanage.email}</span>
                  </div>
                )}

                {(orphanage.contact || orphanage.contactPerson) && (
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-green-700">
                      Contact: {orphanage.contact || orphanage.contactPerson}
                    </span>
                  </div>
                )}

                {orphanage.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="text-green-700">{orphanage.location}</span>
                  </div>
                )}

                {/* Social Media */}
                <div className="pt-4 border-t border-green-200/40">
                  <p className="text-sm font-medium text-green-700 mb-3">Follow Us</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="p-2">
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="p-2">
                      <Instagram className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="p-2">
                      <Youtube className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donation CTA */}
            <Card className="shadow-lg border border-white/50 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl">
              <CardContent className="p-6 text-center space-y-4">
                <Heart className="h-8 w-8 mx-auto" />
                <h3 className="text-lg font-semibold">Make a Difference</h3>
                <p className="text-green-100 text-sm">
                  Your donation can bring hope and joy to these children.
                </p>
                <Button
                  onClick={() => navigate(`/donate?orphanage=${orphanage.id}`)}
                  className="w-full bg-white text-green-600 hover:bg-green-50"
                >
                  Donate Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrphanageDetails

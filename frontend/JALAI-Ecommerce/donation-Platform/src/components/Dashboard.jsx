import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Mail, Instagram, Youtube, Heart, Users, Star, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import OrphanageCard from './OrphanageCard'
import apiService from '@/services/apiService'

function Dashboard() {
  const [query, setQuery] = useState('')
  const [orphanages, setOrphanages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    document.title = 'JALAI - Donate Dashboard'
    fetchOrphanages()
  }, [])

  const fetchOrphanages = async () => {
    try {
      setLoading(true)
      setError(null)
      // Fetch orphanages from backend
      const response = await apiService.getAllOrphanages()
      setOrphanages(response || [])
    } catch (error) {
      console.error('Error fetching orphanages:', error)
      setError('Failed to load orphanages. Please try again later.')
      setOrphanages([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const filtered = orphanages.filter(o =>
    o.name?.toLowerCase().includes(query.toLowerCase()) ||
    o.location?.toLowerCase().includes(query.toLowerCase())
  )

  const testimonials = [
    {
      text: "Supporting this mission has been a blessing. Every child deserves love!",
      author: "Laeticia J."
    },
    {
      text: "I'm grateful I could donate clothes and see the impact instantly.",
      author: "Bei M."
    },
    {
      text: "Trustworthy and transparent. Happy to contribute regularly.",
      author: "Lucie D."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* NAVBAR */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-green-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-green-600">JALAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-green-800">Choose an Orphanage</h2>
              {user && (
                <Button
                  onClick={() => navigate('/user-dashboard')}
                  variant="outline"
                  className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to My Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* SEARCH BAR */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
          <Input
            className="pl-12 pr-4 py-3 border border-green-200/60 focus:border-green-400/60 focus:ring-2 focus:ring-green-200/40 transition-all duration-500 hover:border-green-300/60 bg-white/80 backdrop-blur-sm rounded-2xl text-green-800 placeholder:text-green-400"
            placeholder="Search orphanages..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* CTA BANNER */}
        <Card className="shadow-xl border border-white/50 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-3xl overflow-hidden">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl font-bold">Join Our Mission</h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Together, we can make a difference in the lives of many children.
            </p>
            <Button 
              className="bg-white text-green-600 hover:bg-green-50 px-8 py-3 text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              Become a Volunteer
            </Button>
          </CardContent>
        </Card>

        {/* TESTIMONIALS */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-green-800 text-center">What Our Donors Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-lg border border-white/50 bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-center">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-green-700 italic text-center">"{testimonial.text}"</p>
                  <p className="text-green-600 font-medium text-center">– {testimonial.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg border border-white/50 bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardContent className="p-6 text-center space-y-2">
              <Users className="h-8 w-8 text-green-500 mx-auto" />
              <h3 className="text-2xl font-bold text-green-800">{orphanages.length}</h3>
              <p className="text-green-600">Orphanages Supported</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border border-white/50 bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardContent className="p-6 text-center space-y-2">
              <Heart className="h-8 w-8 text-green-500 mx-auto" />
              <h3 className="text-2xl font-bold text-green-800">1,200+</h3>
              <p className="text-green-600">Children Helped</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border border-white/50 bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardContent className="p-6 text-center space-y-2">
              <Star className="h-8 w-8 text-green-500 mx-auto" />
              <h3 className="text-2xl font-bold text-green-800">500+</h3>
              <p className="text-green-600">Active Donors</p>
            </CardContent>
          </Card>
        </div>

        {/* ORPHANAGE CARDS */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-3xl font-bold text-green-800">
              {query ? `Search Results (${filtered.length})` : 'Available Orphanages'}
            </h2>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search orphanages or locations..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400 rounded-xl"
              />
            </div>
          </div>

          {loading ? (
            <Card className="shadow-lg border border-white/50 bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden">
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Loading orphanages...</h3>
                <p className="text-green-600">Please wait while we fetch the latest data</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="shadow-lg border border-white/50 bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden">
              <CardContent className="p-12 text-center">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-500 text-2xl">⚠️</span>
                </div>
                <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Orphanages</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                  onClick={fetchOrphanages}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="shadow-lg border border-white/50 bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden">
              <CardContent className="p-12 text-center">
                <Search className="h-16 w-16 text-green-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  {orphanages.length === 0 ? 'No orphanages available' : 'No orphanages found'}
                </h3>
                <p className="text-green-600">
                  {orphanages.length === 0
                    ? 'There are currently no orphanages registered in the system.'
                    : 'Try adjusting your search terms'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((orphanage) => (
                <OrphanageCard key={orphanage.id} orphanage={orphanage} />
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="bg-green-800 text-white rounded-3xl p-8 text-center space-y-6">
          <p className="text-lg italic">
            "It is more blessed to give than to receive." – Acts 20:35
          </p>
          <div className="flex justify-center space-x-6">
            <a 
              href="mailto:donate@jalai.org" 
              className="p-3 bg-green-700 hover:bg-green-600 rounded-full transition-colors duration-300"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-green-700 hover:bg-green-600 rounded-full transition-colors duration-300"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-green-700 hover:bg-green-600 rounded-full transition-colors duration-300"
              aria-label="YouTube"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>
          <p className="text-green-200 text-sm">
            © 2024 JALAI. All rights reserved. Made with ❤️ for orphaned children.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default Dashboard

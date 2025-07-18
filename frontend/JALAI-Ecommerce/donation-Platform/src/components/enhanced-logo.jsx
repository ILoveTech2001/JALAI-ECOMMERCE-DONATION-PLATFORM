import React, { useState, useEffect } from "react"
import { Sparkles, Star, Heart } from "lucide-react"

export function EnhancedLogo({ className = "" }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [particles, setParticles] = useState([])

  // Generate random particles on hover
  useEffect(() => {
    if (isHovered) {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        delay: Math.random() * 1000,
        duration: 2000 + Math.random() * 1000,
      }))
      setParticles(newParticles)
    } else {
      setParticles([])
    }
  }, [isHovered])

  const handleClick = () => {
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 600)
  }

  return (
    <div
      className={`flex items-center justify-center animate-in slide-in-from-top-5 duration-1000 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="relative group cursor-pointer">
        {/* Background glow effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-r from-green-400/30 via-emerald-400/40 to-teal-400/30 rounded-3xl transition-all duration-700 ${
            isHovered ? "blur-3xl scale-125 opacity-100" : "blur-2xl scale-100 opacity-70"
          } ${isClicked ? "animate-pulse" : ""}`}
        ></div>

        {/* Main logo container with enhanced styling */}
        <div
          className={`relative bg-gradient-to-br from-white/90 via-green-50/70 to-emerald-50/70 backdrop-blur-lg rounded-3xl px-10 py-6 border-2 transition-all duration-500 shadow-2xl ${
            isHovered
              ? "border-green-300/60 shadow-green-200/50 transform scale-105"
              : "border-green-200/40 shadow-green-100/30"
          } ${isClicked ? "animate-bounce" : ""}`}
        >
          {/* Enhanced decorative corner elements */}
          <div className="absolute top-2 left-2">
            <Sparkles className={`h-3 w-3 text-green-400 transition-all duration-500 ${isHovered ? "animate-spin" : ""}`} />
          </div>
          <div className="absolute top-2 right-2">
            <Star className={`h-3 w-3 text-emerald-400 transition-all duration-700 ${isHovered ? "animate-pulse" : ""}`} />
          </div>
          <div className="absolute bottom-2 left-2">
            <Heart className={`h-3 w-3 text-teal-400 transition-all duration-600 ${isHovered ? "animate-bounce" : ""}`} />
          </div>
          <div className="absolute bottom-2 right-2">
            <Sparkles className={`h-3 w-3 text-green-500 transition-all duration-800 ${isHovered ? "animate-spin" : ""}`} />
          </div>

          {/* Main logo text with enhanced effects */}
          <div className="text-center relative z-10">
            <h1
              className={`text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent transition-all duration-500 ${
                isHovered ? "scale-110 drop-shadow-lg" : ""
              }`}
            >
              JALAI
            </h1>

            {/* Subtitle text */}
            <div
              className={`text-xs font-medium text-green-500/80 text-center mt-3 tracking-widest uppercase transition-all duration-500 ${
                isHovered ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-2"
              }`}
            >
              Caring & Sharing
            </div>
          </div>
        </div>

        {/* Dynamic floating particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute pointer-events-none"
            style={{
              left: `calc(50% + ${particle.x}px)`,
              top: `calc(50% + ${particle.y}px)`,
              animationDelay: `${particle.delay}ms`,
              animationDuration: `${particle.duration}ms`,
            }}
          >
            <Sparkles className="h-2 w-2 text-green-400 animate-ping" />
          </div>
        ))}

        {/* Click ripple effect */}
        {isClicked && (
          <div className="absolute inset-0 rounded-3xl border-4 border-green-400/50 animate-ping pointer-events-none" />
        )}
      </div>
    </div>
  )
}

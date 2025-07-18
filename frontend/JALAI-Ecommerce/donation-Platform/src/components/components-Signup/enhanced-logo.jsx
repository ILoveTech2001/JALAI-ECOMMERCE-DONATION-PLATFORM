"use client"

import { Sparkles, Star, Heart } from "lucide-react"
import { useState, useEffect } from "react"

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

        {/* Secondary glow layer */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-emerald-300/20 via-green-300/30 to-teal-300/20 rounded-3xl transition-all duration-500 ${
            isHovered ? "blur-xl scale-110" : "blur-lg"
          }`}
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
          <DecorativeElements isHovered={isHovered} />

          {/* Multiple sparkle layers */}
          <SparkleIcons isHovered={isHovered} />

          {/* Main text with premium styling */}
          <div className="relative">
            <div
              className={`text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-wider drop-shadow-lg transition-all duration-500 ${
                isHovered ? "scale-110 drop-shadow-2xl" : ""
              }`}
            >
              JALAI
            </div>

            {/* Enhanced underline with animation */}
            <div
              className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-full transition-all duration-500 ${
                isHovered ? "w-20 h-1" : "w-14 h-0.5"
              }`}
            ></div>

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
        <DynamicParticles particles={particles} />

        {/* Orbiting elements */}
        <OrbitingElements isHovered={isHovered} />

        {/* Click ripple effect */}
        {isClicked && <ClickRipple />}
      </div>
    </div>
  )
}

function DecorativeElements({ isHovered }) {
  const elements = [
    {
      position: "-top-2 -left-2",
      size: "w-4 h-4",
      gradient: "from-green-400 to-emerald-500",
      delay: "",
      hoverScale: "scale-150",
    },
    {
      position: "-top-2 -right-2",
      size: "w-3 h-3",
      gradient: "from-teal-400 to-green-500",
      delay: "delay-200",
      hoverScale: "scale-125",
    },
    {
      position: "-bottom-2 -left-2",
      size: "w-3 h-3",
      gradient: "from-emerald-400 to-teal-500",
      delay: "delay-400",
      hoverScale: "scale-125",
    },
    {
      position: "-bottom-2 -right-2",
      size: "w-4 h-4",
      gradient: "from-green-500 to-emerald-400",
      delay: "delay-600",
      hoverScale: "scale-150",
    },
  ]

  return (
    <>
      {elements.map((element, index) => (
        <div
          key={index}
          className={`absolute ${element.position} ${element.size} bg-gradient-to-br ${element.gradient} rounded-full transition-all duration-500 ${element.delay} ${
            isHovered ? `${element.hoverScale} animate-pulse` : "animate-pulse"
          }`}
        />
      ))}

      {/* Additional corner accents */}
      <div
        className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full transition-all duration-500 ${isHovered ? "scale-150 animate-ping" : "animate-pulse"}`}
      />
      <div
        className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-green-400 to-teal-400 rounded-full transition-all duration-500 delay-300 ${isHovered ? "scale-150 animate-ping" : "animate-pulse"}`}
      />
    </>
  )
}

function SparkleIcons({ isHovered }) {
  const sparkles = [
    { Icon: Sparkles, position: "-top-3 left-1/4", size: "h-4 w-4", color: "text-green-400", delay: "delay-100" },
    { Icon: Star, position: "-top-3 right-1/4", size: "h-3 w-3", color: "text-emerald-400", delay: "delay-300" },
    { Icon: Heart, position: "-bottom-3 left-1/3", size: "h-3 w-3", color: "text-red-400", delay: "delay-500" },
    { Icon: Sparkles, position: "-bottom-3 right-1/3", size: "h-4 w-4", color: "text-green-500", delay: "delay-700" },
    { Icon: Star, position: "top-1/2 -left-4", size: "h-2 w-2", color: "text-emerald-300", delay: "delay-200" },
    { Icon: Heart, position: "top-1/2 -right-4", size: "h-2 w-2", color: "text-red-300", delay: "delay-400" },
  ]

  return (
    <>
      {sparkles.map((sparkle, index) => (
        <sparkle.Icon
          key={index}
          className={`absolute ${sparkle.position} ${sparkle.size} ${sparkle.color} transition-all duration-500 ${sparkle.delay} ${
            isHovered ? "animate-spin scale-125" : "animate-pulse"
          }`}
        />
      ))}
    </>
  )
}

function DynamicParticles({ particles }) {
  return (
    <>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-1/2 left-1/2 w-1 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-ping"
          style={{
            transform: `translate(${particle.x}px, ${particle.y}px)`,
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${particle.duration}ms`,
          }}
        />
      ))}
    </>
  )
}

function OrbitingElements({ isHovered }) {
  return (
    <>
      {/* Orbiting rings */}
      <div
        className={`absolute inset-0 rounded-full border border-green-200/30 transition-all duration-1000 ${isHovered ? "animate-spin scale-150" : ""}`}
        style={{ animationDuration: "8s" }}
      />
      <div
        className={`absolute inset-2 rounded-full border border-emerald-200/20 transition-all duration-1000 ${isHovered ? "animate-spin scale-125" : ""}`}
        style={{ animationDuration: "6s", animationDirection: "reverse" }}
      />

      {/* Orbiting dots */}
      <div
        className={`absolute top-0 left-1/2 w-1 h-1 bg-green-400 rounded-full transition-all duration-1000 ${isHovered ? "animate-spin" : ""}`}
        style={{ transformOrigin: "0 60px", animationDuration: "4s" }}
      />
      <div
        className={`absolute bottom-0 left-1/2 w-1 h-1 bg-emerald-400 rounded-full transition-all duration-1000 ${isHovered ? "animate-spin" : ""}`}
        style={{ transformOrigin: "0 -60px", animationDuration: "4s", animationDirection: "reverse" }}
      />
    </>
  )
}

function ClickRipple() {
  return <div className="absolute inset-0 rounded-full border-4 border-green-400/50 animate-ping" />
}

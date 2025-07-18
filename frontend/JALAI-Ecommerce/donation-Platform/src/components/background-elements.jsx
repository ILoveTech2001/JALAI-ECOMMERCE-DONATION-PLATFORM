import React from "react"

export function BackgroundElements() {
  const elements = [
    { position: "-top-40 -right-40", size: "w-80 h-80", gradient: "from-green-100/30 to-emerald-100/30", delay: "" },
    {
      position: "-bottom-40 -left-40",
      size: "w-80 h-80",
      gradient: "from-teal-100/30 to-green-100/30",
      delay: "delay-1000",
    },
    {
      position: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
      size: "w-96 h-96",
      gradient: "from-emerald-100/20 to-green-100/20",
      delay: "delay-500",
    },
    { position: "top-20 left-20", size: "w-60 h-60", gradient: "from-green-100/25 to-teal-100/25", delay: "delay-700" },
    {
      position: "bottom-20 right-20",
      size: "w-60 h-60",
      gradient: "from-emerald-100/25 to-green-100/25",
      delay: "delay-300",
    },
    {
      position: "top-1/3 right-1/4",
      size: "w-40 h-40",
      gradient: "from-teal-100/30 to-emerald-100/30",
      delay: "delay-1200",
    },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden">
      {elements.map((element, index) => (
        <div
          key={index}
          className={`absolute ${element.position} ${element.size} bg-gradient-to-r ${element.gradient} rounded-full blur-3xl animate-pulse ${element.delay}`}
        />
      ))}
    </div>
  )
}

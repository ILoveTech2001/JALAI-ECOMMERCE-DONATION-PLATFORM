"use client"

import { CheckCircle, Circle } from "lucide-react"

export function PasswordStrength({ password }) {
  const requirements = [
    { label: "At least 8 characters", test: (pwd) => pwd.length >= 8 },
    { label: "One lowercase letter", test: (pwd) => /(?=.*[a-z])/.test(pwd) },
    { label: "One uppercase letter", test: (pwd) => /(?=.*[A-Z])/.test(pwd) },
    { label: "One number", test: (pwd) => /(?=.*\d)/.test(pwd) },
  ]

  const passedRequirements = requirements.filter((req) => req.test(password))
  const strength = passedRequirements.length

  const getStrengthColor = () => {
    if (strength === 0) return "bg-gray-200"
    if (strength <= 1) return "bg-red-400"
    if (strength <= 2) return "bg-yellow-400"
    if (strength <= 3) return "bg-orange-400"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    if (strength === 0) return "Enter password"
    if (strength <= 1) return "Weak"
    if (strength <= 2) return "Fair"
    if (strength <= 3) return "Good"
    return "Strong"
  }

  if (!password) return null

  return (
    <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
      {/* Strength bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-green-600">Password strength</span>
          <span className={`text-xs font-medium ${strength >= 3 ? "text-green-600" : "text-orange-500"}`}>
            {getStrengthText()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${getStrengthColor()}`}
            style={{ width: `${(strength / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1">
        {requirements.map((requirement, index) => {
          const isPassed = requirement.test(password)
          return (
            <div key={index} className="flex items-center space-x-2">
              {isPassed ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <Circle className="h-3 w-3 text-gray-300" />
              )}
              <span className={`text-xs ${isPassed ? "text-green-600" : "text-gray-500"}`}>{requirement.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

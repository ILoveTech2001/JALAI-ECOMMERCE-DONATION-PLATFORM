"use client"

import { useState, useCallback } from "react"

export function useSignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev)
  }, [])

  const updateFormData = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setIsLoading(true)

      try {
        // Simulate signup process
        await new Promise((resolve) => setTimeout(resolve, 2500))
        console.log("Signup attempt:", formData)
        // Handle successful signup here
      } catch (error) {
        console.error("Signup failed:", error)
        // Handle signup error here
      } finally {
        setIsLoading(false)
      }
    },
    [formData],
  )

  const handleSocialSignup = useCallback((provider) => {
    console.log(`${provider} signup initiated`)
    // Implement social signup logic here
  }, [])

  return {
    isLoading,
    showPassword,
    showConfirmPassword,
    formData,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    updateFormData,
    handleSubmit,
    handleSocialSignup,
  }
}

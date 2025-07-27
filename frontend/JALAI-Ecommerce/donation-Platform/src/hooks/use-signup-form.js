import { useState, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

export function useSignupForm() {
  const { register, loading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
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
      // Don't clear error immediately - let user see previous errors

      // Validate form
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match")
        return
      }

      if (!formData.agreeToTerms) {
        alert("Please agree to the terms and conditions")
        return
      }

      setIsLoading(true)

      try {
        const userData = {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
          phone: formData.phone || "+1234567890", // Default phone if not provided
          location: formData.location || "Not specified", // Default location if not provided
        }

        console.log('Attempting signup with:', { ...userData, password: '***' }); // Debug log
        const response = await register(userData, 'client')
        console.log('Signup successful, response:', response); // Debug log

        // Clear any previous errors on successful registration
        clearError()

        // Clear form fields on successful registration
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
          location: "",
          agreeToTerms: false,
        })

        // Only redirect on successful registration
        console.log('Redirecting to user dashboard...'); // Debug log
        navigate('/user-dashboard')
      } catch (error) {
        console.error("Signup failed:", error)
        console.error('Signup error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
        // Error is handled by the auth context and will be displayed
        // Don't redirect on error - stay on signup page
        console.log('Staying on signup page due to error'); // Debug log

        // Also show an alert for immediate feedback
        alert(`Signup failed: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    },
    [formData, register, navigate, clearError],
  )

  const handleSocialSignup = useCallback(
    async (provider) => {
      setIsLoading(true)

      try {
        // Simulate social signup process
        await new Promise((resolve) => setTimeout(resolve, 1500))
        console.log(`${provider} signup attempt`)
        // Handle successful social signup here
      } catch (error) {
        console.error(`${provider} signup failed:`, error)
        // Handle social signup error here
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  return {
    isLoading: isLoading || loading,
    showPassword,
    showConfirmPassword,
    formData,
    error,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    updateFormData,
    handleSubmit,
    handleSocialSignup,
    navigate,
    clearError,
  }
}

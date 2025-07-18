import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"

import { EnhancedLogo } from "./enhanced-logo"
import { FormField } from "./form-field"
import { SocialButton } from "./social-button"
import { BackgroundElements } from "./background-elements"
import { PasswordStrength } from "./password-strength"
import { useSignupForm } from "@/hooks/use-signup-form"

export default function SignupForm() {
  const {
    isLoading,
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
  } = useSignupForm()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-emerald-50 via-teal-50 to-white relative overflow-hidden">
      {/* Animated background elements */}
      <BackgroundElements />

      <Card className="w-full max-w-lg relative z-10 shadow-xl border border-white/50 bg-white/90 backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-700 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-green-50/30 to-emerald-50/30 rounded-3xl"></div>

        <CardHeader className="space-y-6 text-center pb-8 relative z-10">
          <EnhancedLogo />

          <div className="space-y-3 animate-in slide-in-from-top-5 duration-1000 delay-200">
            <CardTitle className="text-2xl font-light text-green-800">Join JALAI</CardTitle>
            <CardDescription className="text-green-600 text-sm leading-relaxed">
              Create your account and start your shopping journey with us
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="firstName"
                label="First Name"
                type="text"
                placeholder="John"
                icon={User}
                required
                value={formData.firstName}
                onChange={(e) => updateFormData("firstName", e.target.value)}
              />

              <FormField
                id="lastName"
                label="Last Name"
                type="text"
                placeholder="Doe"
                icon={User}
                required
                value={formData.lastName}
                onChange={(e) => updateFormData("lastName", e.target.value)}
              />
            </div>

            {/* Email field */}
            <FormField
              id="email"
              label="Email Address"
              type="email"
              placeholder="john.doe@example.com"
              icon={Mail}
              required
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
            />

            {/* Password field */}
            <FormField
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              icon={Lock}
              required
              value={formData.password}
              onChange={(e) => updateFormData("password", e.target.value)}
              rightElement={
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-green-400 hover:text-green-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            {/* Password strength indicator */}
            <PasswordStrength password={formData.password} />

            {/* Confirm password field */}
            <FormField
              id="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              icon={Lock}
              required
              value={formData.confirmPassword}
              onChange={(e) => updateFormData("confirmPassword", e.target.value)}
              rightElement={
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="text-green-400 hover:text-green-600 transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            {/* Phone field */}
            <FormField
              id="phone"
              label="Phone Number"
              type="tel"
              placeholder="+1234567890"
              icon={User}
              value={formData.phone}
              onChange={(e) => updateFormData("phone", e.target.value)}
            />

            {/* Location field */}
            <FormField
              id="location"
              label="Location"
              type="text"
              placeholder="City, Country"
              icon={User}
              value={formData.location}
              onChange={(e) => updateFormData("location", e.target.value)}
            />

            {/* Terms and conditions */}
            <div className="flex items-start space-x-3 p-4 bg-green-50/50 rounded-2xl animate-in slide-in-from-left-5 duration-1000 delay-700">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={(e) => updateFormData("agreeToTerms", e.target.checked)}
                className="w-4 h-4 text-green-500 border-green-300 rounded focus:ring-green-200 focus:ring-2 mt-0.5"
                required
              />
              <Label htmlFor="agreeToTerms" className="text-sm text-green-700 leading-relaxed">
                I agree to the{" "}
                <a href="#" className="text-green-600 hover:text-green-800 underline font-medium">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-green-600 hover:text-green-800 underline font-medium">
                  Privacy Policy
                </a>
              </Label>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg animate-pulse">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Registration Error</h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] animate-in slide-in-from-bottom-5 duration-1000 delay-800"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative animate-in fade-in-0 duration-1000 delay-900">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-green-200/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/90 px-3 text-green-500 font-medium tracking-wider">Or continue with</span>
            </div>
          </div>

          {/* Social signup buttons */}
          <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-5 duration-1000 delay-1000">
            <SocialButton
              provider="google"
              onClick={() => handleSocialSignup("google")}
              disabled={isLoading}
            />
            <SocialButton
              provider="facebook"
              onClick={() => handleSocialSignup("facebook")}
              disabled={isLoading}
            />
          </div>

          {/* Sign in link */}
          <div className="text-center animate-in fade-in-0 duration-1000 delay-1100">
            <p className="text-sm text-green-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  // Clear form fields before navigating
                  updateFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    phone: "",
                    location: "",
                    agreeToTerms: false,
                  })
                  clearError()
                  navigate('/login')
                }}
                className="text-green-700 hover:text-green-800 font-medium underline transition-colors duration-200 bg-transparent border-none cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

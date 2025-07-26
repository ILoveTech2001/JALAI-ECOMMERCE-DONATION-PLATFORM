import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingBag, Lock, Mail, Eye, EyeOff } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

// Google Logo Component
const GoogleLogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

export default function LoginForm() {
  const navigate = useNavigate()
  const { login, loading, clearError } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError && clearError()
    setError("") // Clear local error state

    try {
      console.log('🟢 Starting login process...');
      const response = await login(email, password)
      console.log('🟢 Login response:', response);

      // Clear form
      setEmail("")
      setPassword("")
      setRememberMe(false)

      // Get user type from response
      const userType = response?.user?.userType
      console.log('🟢 User type:', userType);

      // Give AuthContext a moment to fully set the user state before navigating
      setTimeout(() => {
        console.log('🟢 CRITICAL: Starting navigation process...');
        console.log('🟢 Current URL before navigation:', window.location.href);
        console.log('🟢 User data before navigation:', response.user);
        console.log('🟢 UserType determined:', userType);

        // Force a page reload after navigation to ensure clean state
        if (userType === 'ADMIN') {
          console.log('🟢 Navigating to /admin');
          window.location.href = '/admin';
        } else if (userType === 'ORPHANAGE') {
          console.log('🟢 Navigating to /orphanage-dashboard');
          window.location.href = '/orphanage-dashboard';
        } else {
          console.log('🟢 CRITICAL: Navigating to /user-dashboard');
          console.log('🟢 Using window.location.href for hard navigation');
          window.location.href = '/user-dashboard';
        }

        // Fallback with React Router if window.location doesn't work
        setTimeout(() => {
          console.log('🟡 Fallback: Using React Router navigation');
          if (userType === 'ADMIN') {
            navigate('/admin', { replace: true });
          } else if (userType === 'ORPHANAGE') {
            navigate('/orphanage-dashboard', { replace: true });
          } else {
            navigate('/user-dashboard', { replace: true });
          }
        }, 500);
      }, 1500); // Increased to 1500ms to ensure AuthContext is fully updated

    } catch (error) {
      console.error('Login failed:', error)
      setError(error.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Card className="w-full shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-600 p-3 rounded-full mr-3">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-green-600">JALAI</h1>
                <p className="text-green-500 text-sm">Caring & Sharing</p>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Welcome Back</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Sign in to your account to continue
            </CardDescription>

          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="beiashelimofor@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 text-base border-2 border-gray-200 focus:border-green-500 rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 text-base border-2 border-gray-200 focus:border-green-500 rounded-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <Label htmlFor="remember" className="text-base text-gray-700 cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Button variant="link" className="text-base text-green-600 hover:text-green-700 p-0">
                Forgot password?
              </Button>
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
                    <h3 className="text-sm font-medium text-red-800">Login Error</h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                    <button
                      onClick={clearError}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-base">
                <span className="bg-white px-4 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-semibold border-2 border-gray-200 hover:bg-gray-50 rounded-lg"
            >
              <GoogleLogo />
              <span className="ml-3">Sign in with Google</span>
            </Button>
          </CardContent>

          <CardFooter className="text-center">
            <p className="text-base text-gray-600">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="text-base text-green-600 hover:text-green-700 p-0"
                onClick={() => {
                  // Clear form fields before navigating
                  setEmail("")
                  setPassword("")
                  setRememberMe(false)
                  clearError()
                  navigate('/signup')
                }}
              >
                Sign up
              </Button>
            </p>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
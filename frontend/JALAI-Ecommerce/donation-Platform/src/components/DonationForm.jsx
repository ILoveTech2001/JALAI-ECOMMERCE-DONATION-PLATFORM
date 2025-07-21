import React, { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Heart,
  DollarSign,
  Package,
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Home,
  Truck,
  Clock,
  AlertCircle,
  Star,
  Hash,
  FileText,
} from "lucide-react"

import { EnhancedLogo } from "./enhanced-logo"
import { FormField } from "./form-field"
import { SelectField } from "./select-field"
import { BackgroundElements } from "./background-elements"
import { DonationSummary } from "./donation-summary"
import { SuccessMessage } from "./success-message"
import { OrphanageInfoCard } from "./orphanage-info-card"
import { useDonationForm } from "@/hooks/use-donation-form"
import { useAuth } from "@/contexts/AuthContext"
import apiService from "@/services/apiService"

export default function DonationForm() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [orphanage, setOrphanage] = React.useState(null)
  const [loadingOrphanage, setLoadingOrphanage] = React.useState(true)

  const {
    isLoading,
    isSubmitted,
    currentStep,
    formData,
    errors,
    updateFormData,
    nextStep,
    prevStep,
    handleSubmit,
    resetForm,
    isStepValid,
    initializeFormData,
  } = useDonationForm()

  const stepTitles = ["Your Information", "Donation Details", "Review & Submit"]

  // Auto-fill user information and get orphanage from URL
  useEffect(() => {
    const orphanageId = searchParams.get('orphanage')

    // Auto-fill user information if logged in
    if (user && !formData.donorName) {
      initializeFormData()
    }

    // Fetch orphanage details if ID is provided
    if (orphanageId) {
      fetchOrphanageDetails(orphanageId)
    } else {
      setLoadingOrphanage(false)
    }
  }, [user, searchParams, formData.donorName, initializeFormData])

  const fetchOrphanageDetails = async (orphanageId) => {
    try {
      setLoadingOrphanage(true)
      const response = await apiService.getOrphanage(orphanageId)
      setOrphanage(response)
      // Auto-fill orphanage information
      initializeFormData({
        orphanageId: response.id,
        orphanageName: response.name,
        orphanageContact: response.contact || response.email,
        location: response.location,
      })
    } catch (error) {
      console.error('Error fetching orphanage details:', error)
    } finally {
      setLoadingOrphanage(false)
    }
  }

  // If form is successfully submitted, show success message
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-emerald-50 via-teal-50 to-white relative overflow-hidden">
        <BackgroundElements />
        <SuccessMessage formData={formData} onReset={resetForm} />
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <DonorInformationStep formData={formData} updateFormData={updateFormData} errors={errors} orphanage={orphanage} />
      case 2:
        return <DonationDetailsStep formData={formData} updateFormData={updateFormData} errors={errors} />
      case 3:
        return (
          <ReviewStep
            formData={formData}
            updateFormData={updateFormData}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            errors={errors}
            orphanage={orphanage}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-emerald-50 via-teal-50 to-white relative overflow-hidden">
      <BackgroundElements />

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-2xl border border-white/50 bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-green-50/30 to-emerald-50/30 rounded-3xl"></div>

            <CardHeader className="space-y-6 text-center pb-8 relative z-10">
              <EnhancedLogo />

              <div className="space-y-3">
                <CardTitle className="text-2xl font-light text-green-800">Make a Donation</CardTitle>
                <CardDescription className="text-green-600 text-sm leading-relaxed">
                  Help us support orphanages and make a difference in children's lives
                </CardDescription>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-green-600">
                  {stepTitles.map((title, index) => (
                    <span
                      key={index}
                      className={`${
                        index + 1 <= currentStep ? "text-green-700 font-medium" : "text-green-400"
                      }`}
                    >
                      {title}
                    </span>
                  ))}
                </div>
                <Progress value={(currentStep / stepTitles.length) * 100} className="h-2" />
              </div>
            </CardHeader>

            <CardContent className="space-y-8 px-8 pb-8 relative z-10">
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2 border-green-200 text-green-700 hover:bg-green-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                {currentStep < stepTitles.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid(currentStep)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading || !isStepValid(currentStep)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4" />
                        <span>Submit Donation</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Donation Summary Sidebar */}
        <div className="lg:col-span-1">
          <DonationSummary formData={formData} />
        </div>
      </div>
    </div>
  )
}

// Step Components
function DonorInformationStep({ formData, updateFormData, errors, orphanage }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-green-800 mb-4">Tell us about yourself</h3>

      {/* Show orphanage info if available */}
      {orphanage && (
        <div className="bg-blue-50/50 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Building className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-blue-800">Donating to: {orphanage.name}</h4>
          </div>
          <p className="text-sm text-blue-700">
            <MapPin className="h-4 w-4 inline mr-1" />
            {orphanage.location}
          </p>
        </div>
      )}

      <FormField
        id="donorName"
        label="Full Name"
        type="text"
        placeholder="Enter your full name"
        icon={User}
        required
        value={formData.donorName}
        onChange={(e) => updateFormData("donorName", e.target.value)}
        error={errors.donorName}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="donorEmail"
          label="Email Address"
          type="email"
          placeholder="your.email@example.com"
          icon={Mail}
          required
          value={formData.donorEmail}
          onChange={(e) => updateFormData("donorEmail", e.target.value)}
          error={errors.donorEmail}
        />

        <FormField
          id="donorPhone"
          label="Phone Number"
          type="tel"
          placeholder="+237 6XX XXX XXX"
          icon={Phone}
          required
          value={formData.donorPhone}
          onChange={(e) => updateFormData("donorPhone", e.target.value)}
          error={errors.donorPhone}
        />
      </div>

      <FormField
        id="donorAddress"
        label="Address"
        type="text"
        placeholder="Your full address"
        icon={Home}
        value={formData.donorAddress}
        onChange={(e) => updateFormData("donorAddress", e.target.value)}
      />

      <div className="flex items-center space-x-3 p-4 bg-green-50/50 rounded-2xl">
        <input
          type="checkbox"
          id="isAnonymous"
          checked={formData.isAnonymous}
          onChange={(e) => updateFormData("isAnonymous", e.target.checked)}
          className="w-4 h-4 text-green-500 border-green-300 rounded focus:ring-green-200 focus:ring-2"
        />
        <Label htmlFor="isAnonymous" className="text-sm text-green-700">
          Make this donation anonymous
        </Label>
      </div>
    </div>
  )
}



function DonationDetailsStep({ formData, updateFormData, errors }) {
  const itemCategories = [
    { value: "clothing", label: "Clothing & Shoes" },
    { value: "toys", label: "Toys & Games" },
    { value: "books", label: "Books & Educational Materials" },
    { value: "food", label: "Food & Nutrition" },
    { value: "medical", label: "Medical Supplies" },
    { value: "electronics", label: "Electronics" },
    { value: "furniture", label: "Furniture" },
    { value: "utensils", label: "Utensils & Kitchen Items" },
    { value: "other", label: "Other" },
  ]

  const itemConditions = [
    { value: "new", label: "New" },
    { value: "like-new", label: "Like New" },
    { value: "good", label: "Good Condition" },
    { value: "fair", label: "Fair Condition" },
  ]

  const urgencyLevels = [
    { value: "low", label: "Low - No rush" },
    { value: "medium", label: "Medium - Within a month" },
    { value: "high", label: "High - Within a week" },
    { value: "urgent", label: "Urgent - ASAP" },
  ]

  const deliveryMethods = [
    { value: "pickup", label: "I'll arrange pickup" },
    { value: "delivery", label: "I'll deliver personally" },
    { value: "shipping", label: "Ship via courier" },
    { value: "jalai-pickup", label: "JALAI pickup service" },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-green-800 mb-4">What would you like to donate?</h3>

      {/* Donation Type Selection */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-green-700 flex items-center gap-2">
          <Heart className="h-4 w-4 text-green-500" />
          Donation Type *
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
              formData.donationType === "monetary"
                ? "border-green-400 bg-green-50/50"
                : "border-green-200/60 hover:border-green-300/60"
            }`}
            onClick={() => updateFormData("donationType", "monetary")}
          >
            <div className="flex items-center space-x-3">
              <DollarSign className="h-6 w-6 text-green-500" />
              <div>
                <h4 className="font-medium text-green-800">Monetary Donation</h4>
                <p className="text-sm text-green-600">Donate money directly</p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
              formData.donationType === "items"
                ? "border-green-400 bg-green-50/50"
                : "border-green-200/60 hover:border-green-300/60"
            }`}
            onClick={() => updateFormData("donationType", "items")}
          >
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6 text-green-500" />
              <div>
                <h4 className="font-medium text-green-800">In-Kind Donation</h4>
                <p className="text-sm text-green-600">Donate physical items</p>
              </div>
            </div>
          </div>
        </div>
        {errors.donationType && <p className="text-xs text-red-500 mt-1">{errors.donationType}</p>}
      </div>

      {/* Monetary Donation Fields */}
      {formData.donationType === "monetary" && (
        <div className="space-y-4">
          <FormField
            id="monetaryAmount"
            label="Donation Amount (CFA Francs)"
            type="number"
            placeholder="Enter amount (e.g., 50000)"
            icon={DollarSign}
            required
            value={formData.monetaryAmount}
            onChange={(e) => updateFormData("monetaryAmount", e.target.value)}
            error={errors.monetaryAmount}
          />

          <div className="space-y-3">
            <Label className="text-sm font-medium text-green-700">Message (Optional)</Label>
            <Textarea
              placeholder="Add a personal message with your donation..."
              value={formData.message}
              onChange={(e) => updateFormData("message", e.target.value)}
              className="min-h-[100px] border-green-200 focus:border-green-400 focus:ring-green-400 rounded-xl"
            />
          </div>
        </div>
      )}

      {/* In-Kind Donation Fields */}
      {formData.donationType === "items" && (
        <div className="space-y-6">
          <div className="bg-blue-50/50 rounded-2xl p-4">
            <p className="text-sm text-blue-700 leading-relaxed">
              <strong>📦 In-Kind Donations</strong> are physical items that directly benefit the children.
              Please provide detailed information to help us coordinate the donation.
            </p>
          </div>

          <SelectField
            id="itemCategory"
            label="Item Category"
            placeholder="Select category"
            icon={Package}
            required
            options={itemCategories}
            value={formData.itemCategory}
            onValueChange={(value) => updateFormData("itemCategory", value)}
            error={errors.itemCategory}
          />

          <div className="space-y-3">
            <Label className="text-sm font-medium text-green-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              Item Description *
            </Label>
            <Textarea
              placeholder="Describe the items you're donating (e.g., 20 children's t-shirts, sizes 6-12, various colors)"
              value={formData.itemDescription}
              onChange={(e) => updateFormData("itemDescription", e.target.value)}
              className="min-h-[100px] border-green-200 focus:border-green-400 focus:ring-green-400 rounded-xl"
              required
            />
            {errors.itemDescription && <p className="text-xs text-red-500 mt-1">{errors.itemDescription}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="itemQuantity"
              label="Quantity/Amount"
              type="text"
              placeholder="e.g., 20 pieces, 5 boxes"
              icon={Hash}
              value={formData.itemQuantity}
              onChange={(e) => updateFormData("itemQuantity", e.target.value)}
              error={errors.itemQuantity}
            />

            <SelectField
              id="itemCondition"
              label="Item Condition"
              placeholder="Select condition"
              icon={Star}
              required
              options={itemConditions}
              value={formData.itemCondition}
              onValueChange={(value) => updateFormData("itemCondition", value)}
              error={errors.itemCondition}
            />
          </div>

          <SelectField
            id="urgencyLevel"
            label="Urgency Level"
            placeholder="How urgent is this donation?"
            icon={Clock}
            options={urgencyLevels}
            value={formData.urgencyLevel}
            onValueChange={(value) => updateFormData("urgencyLevel", value)}
          />

          <SelectField
            id="deliveryMethod"
            label="Delivery Method"
            placeholder="How will you deliver the items?"
            icon={Truck}
            required
            options={deliveryMethods}
            value={formData.deliveryMethod}
            onValueChange={(value) => updateFormData("deliveryMethod", value)}
            error={errors.deliveryMethod}
          />

          {formData.deliveryMethod && (
            <FormField
              id="preferredDate"
              label="Preferred Date"
              type="date"
              icon={Calendar}
              value={formData.preferredDate}
              onChange={(e) => updateFormData("preferredDate", e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          )}

          <div className="space-y-3">
            <Label className="text-sm font-medium text-green-700">Additional Notes (Optional)</Label>
            <Textarea
              placeholder="Any special instructions, pickup details, or additional information..."
              value={formData.message}
              onChange={(e) => updateFormData("message", e.target.value)}
              className="min-h-[80px] border-green-200 focus:border-green-400 focus:ring-green-400 rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewStep({ formData, updateFormData, handleSubmit, isLoading, errors, orphanage }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-green-800 mb-4">Review Your Donation</h3>

      {/* Donation Summary */}
      <div className="bg-green-50/50 rounded-2xl p-6 space-y-4">
        <h4 className="font-semibold text-green-800 flex items-center gap-2">
          <Heart className="h-5 w-5 text-green-500" />
          Donation Summary
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-green-600">Donor:</span>
            <p className="font-medium text-green-800">{formData.donorName}</p>
          </div>
          <div>
            <span className="text-green-600">Email:</span>
            <p className="font-medium text-green-800">{formData.donorEmail}</p>
          </div>
          <div>
            <span className="text-green-600">Phone:</span>
            <p className="font-medium text-green-800">{formData.donorPhone}</p>
          </div>
          <div>
            <span className="text-green-600">Orphanage:</span>
            <p className="font-medium text-green-800">{orphanage?.name || formData.orphanageName}</p>
          </div>
        </div>

        <div className="border-t border-green-200/50 pt-4">
          <span className="text-green-600">Donation Type:</span>
          <p className="font-medium text-green-800 capitalize">{formData.donationType}</p>

          {formData.donationType === "monetary" && (
            <div className="mt-2">
              <span className="text-green-600">Amount:</span>
              <p className="font-bold text-green-800 text-lg">{parseInt(formData.monetaryAmount).toLocaleString()} CFA</p>
            </div>
          )}

          {formData.donationType === "items" && (
            <div className="mt-2 space-y-2">
              <div>
                <span className="text-green-600">Category:</span>
                <p className="font-medium text-green-800">{itemCategories.find(cat => cat.value === formData.itemCategory)?.label}</p>
              </div>
              <div>
                <span className="text-green-600">Description:</span>
                <p className="font-medium text-green-800">{formData.itemDescription}</p>
              </div>
              {formData.itemQuantity && (
                <div>
                  <span className="text-green-600">Quantity:</span>
                  <p className="font-medium text-green-800">{formData.itemQuantity}</p>
                </div>
              )}
              {formData.itemCondition && (
                <div>
                  <span className="text-green-600">Condition:</span>
                  <p className="font-medium text-green-800">{itemConditions.find(cond => cond.value === formData.itemCondition)?.label}</p>
                </div>
              )}
              {formData.deliveryMethod && (
                <div>
                  <span className="text-green-600">Delivery:</span>
                  <p className="font-medium text-green-800">{deliveryMethods.find(method => method.value === formData.deliveryMethod)?.label}</p>
                </div>
              )}
            </div>
          )}

          {formData.message && (
            <div className="mt-4">
              <span className="text-green-600">Message:</span>
              <p className="font-medium text-green-800 italic">"{formData.message}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3 p-4 bg-blue-50/50 rounded-2xl">
          <input
            type="checkbox"
            id="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={(e) => updateFormData("agreeToTerms", e.target.checked)}
            className="w-4 h-4 text-green-500 border-green-300 rounded focus:ring-green-200 focus:ring-2 mt-1"
          />
          <Label htmlFor="agreeToTerms" className="text-sm text-green-700 leading-relaxed">
            I agree to the <span className="font-medium">Terms and Conditions</span> and confirm that the information provided is accurate.
            I understand that JALAI will coordinate with the orphanage to ensure proper delivery of my donation.
          </Label>
        </div>
        {errors.agreeToTerms && <p className="text-xs text-red-500 mt-1">{errors.agreeToTerms}</p>}

        <div className="flex items-start space-x-3 p-4 bg-green-50/50 rounded-2xl">
          <input
            type="checkbox"
            id="allowContact"
            checked={formData.allowContact}
            onChange={(e) => updateFormData("allowContact", e.target.checked)}
            className="w-4 h-4 text-green-500 border-green-300 rounded focus:ring-green-200 focus:ring-2 mt-1"
          />
          <Label htmlFor="allowContact" className="text-sm text-green-700 leading-relaxed">
            Allow the orphanage to contact me with updates about how my donation is being used (optional).
          </Label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !formData.agreeToTerms}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl text-lg font-medium"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Donation...
            </>
          ) : (
            <>
              <Heart className="h-5 w-5 mr-2" />
              Submit Donation
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Helper data for ReviewStep
const itemCategories = [
  { value: "clothing", label: "Clothing & Shoes" },
  { value: "toys", label: "Toys & Games" },
  { value: "books", label: "Books & Educational Materials" },
  { value: "food", label: "Food & Nutrition" },
  { value: "medical", label: "Medical Supplies" },
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "utensils", label: "Utensils & Kitchen Items" },
  { value: "other", label: "Other" },
]

const itemConditions = [
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "good", label: "Good Condition" },
  { value: "fair", label: "Fair Condition" },
]

const deliveryMethods = [
  { value: "pickup", label: "I'll arrange pickup" },
  { value: "delivery", label: "I'll deliver personally" },
  { value: "shipping", label: "Ship via courier" },
  { value: "jalai-pickup", label: "JALAI pickup service" },
]

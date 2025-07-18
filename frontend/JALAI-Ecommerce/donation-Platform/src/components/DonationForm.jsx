import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
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
} from "lucide-react"

import { EnhancedLogo } from "./enhanced-logo"
import { FormField } from "./form-field"
import { SelectField } from "./select-field"
import { BackgroundElements } from "./background-elements"
import { DonationSummary } from "./donation-summary"
import { SuccessMessage } from "./success-message"
import { OrphanageInfoCard } from "./orphanage-info-card"
import { useDonationForm } from "@/hooks/use-donation-form"
import { orphanagesData, getOrphanagesByLocation, getOrphanageById } from "@/data/orphanages"

export default function DonationForm() {
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
  } = useDonationForm()

  const stepTitles = ["Your Information", "Orphanage Selection", "Donation Details", "Review & Submit"]

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
        return <DonorInformationStep formData={formData} updateFormData={updateFormData} errors={errors} />
      case 2:
        return <OrphanageSelectionStep formData={formData} updateFormData={updateFormData} errors={errors} />
      case 3:
        return <DonationDetailsStep formData={formData} updateFormData={updateFormData} errors={errors} />
      case 4:
        return (
          <ReviewStep
            formData={formData}
            updateFormData={updateFormData}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            errors={errors}
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
function DonorInformationStep({ formData, updateFormData, errors }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-green-800 mb-4">Tell us about yourself</h3>

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

function OrphanageSelectionStep({ formData, updateFormData, errors }) {
  const locations = [
    { value: "yaounde", label: "Yaoundé, Centre Region" },
    { value: "douala", label: "Douala, Littoral Region" },
    { value: "bamenda", label: "Bamenda, Northwest Region" },
    { value: "bafoussam", label: "Bafoussam, West Region" },
    { value: "garoua", label: "Garoua, North Region" },
    { value: "maroua", label: "Maroua, Far North Region" },
    { value: "ngaoundere", label: "Ngaoundéré, Adamawa Region" },
    { value: "bertoua", label: "Bertoua, East Region" },
    { value: "buea", label: "Buea, Southwest Region" },
    { value: "ebolowa", label: "Ebolowa, South Region" },
    { value: "kumba", label: "Kumba, Southwest Region" },
    { value: "limbe", label: "Limbe, Southwest Region" },
  ]

  // Get orphanages for selected location
  const availableOrphanages = formData.location
    ? getOrphanagesByLocation(formData.location).map((orphanage) => ({
        value: orphanage.id,
        label: orphanage.name,
      }))
    : []

  // Get selected orphanage details
  const selectedOrphanage = formData.orphanageId ? getOrphanageById(formData.orphanageId) : null

  // Handle location change
  const handleLocationChange = (location) => {
    updateFormData("location", location)
    // Clear orphanage selection when location changes
    updateFormData("orphanageId", "")
    updateFormData("orphanageName", "")
  }

  // Handle orphanage selection
  const handleOrphanageChange = (orphanageId) => {
    const orphanage = getOrphanageById(orphanageId)
    updateFormData("orphanageId", orphanageId)
    updateFormData("orphanageName", orphanage ? orphanage.name : "")
    updateFormData("orphanageContact", orphanage ? orphanage.contact : "")
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-green-800 mb-4">Choose an orphanage to support</h3>

      <div className="bg-blue-50/50 rounded-2xl p-4 mb-6">
        <p className="text-sm text-blue-700 leading-relaxed">
          <strong>📍 {orphanagesData.length} verified orphanages</strong> across Cameroon are waiting for your support.
          Select a location first, then choose from the available orphanages in that area.
        </p>
      </div>

      <SelectField
        id="location"
        label="Location"
        placeholder="Select a region/city"
        icon={MapPin}
        required
        options={locations}
        value={formData.location}
        onValueChange={handleLocationChange}
        error={errors.location}
      />

      {formData.location && (
        <SelectField
          id="orphanageId"
          label="Orphanage"
          placeholder={`Select from ${availableOrphanages.length} orphanages in this area`}
          icon={Building}
          required
          options={availableOrphanages}
          value={formData.orphanageId}
          onValueChange={handleOrphanageChange}
          error={errors.orphanageName}
        />
      )}

      {/* Display orphanage information card */}
      {selectedOrphanage && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-green-700">Orphanage Information</Label>
          <OrphanageInfoCard orphanage={selectedOrphanage} />
        </div>
      )}

      {/* Show available orphanages count */}
      {formData.location && !formData.orphanageId && (
        <div className="bg-green-50/50 rounded-2xl p-4">
          <p className="text-sm text-green-700">
            <strong>{availableOrphanages.length} orphanages</strong> available in{" "}
            {locations.find((l) => l.value === formData.location)?.label}
          </p>
        </div>
      )}
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
                <h4 className="font-medium text-green-800">Item Donation</h4>
                <p className="text-sm text-green-600">Donate physical items</p>
              </div>
            </div>
          </div>
        </div>
        {errors.donationType && <p className="text-xs text-red-500 mt-1">{errors.donationType}</p>}
      </div>

      {/* Monetary Donation Fields */}
      {formData.donationType === "monetary" && (
        <FormField
          id="monetaryAmount"
          label="Donation Amount (CFA Francs)"
          type="number"
          placeholder="0"
          icon={DollarSign}
          required
          value={formData.monetaryAmount}
          onChange={(e) => updateFormData("monetaryAmount", e.target.value)}
          error={errors.monetaryAmount}
        />
      )}
    </div>
  )
}

import { useState, useCallback } from "react"
import apiService from "@/services/apiService"
import { useAuth } from "../contexts/AuthContext"

export function useDonationForm() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    // Donor Information
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    donorAddress: "",

    // Orphanage Information
    orphanageId: "",
    orphanageName: "",
    orphanageContact: "",
    location: "",

    // Donation Details
    donationType: "", // 'monetary' or 'items'
    monetaryAmount: "",
    itemCategory: "",
    itemDescription: "",
    itemQuantity: "",
    itemCondition: "",

    // Additional Information
    urgencyLevel: "",
    deliveryMethod: "",
    preferredDate: "",
    message: "",

    // Agreements
    agreeToTerms: false,
    allowContact: false,
    isAnonymous: false,
  })



  const updateFormData = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))

      // Clear error for this field when it's updated
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }))
      }
    },
    [errors],
  )

  // Validation function for each step
  const validateStep = useCallback((step, data) => {
    const stepErrors = {}

    switch (step) {
      case 1: // Donor Information
        if (!data.donorName.trim()) stepErrors.donorName = "Full name is required"
        if (!data.donorEmail.trim()) stepErrors.donorEmail = "Email is required"
        if (!data.donorPhone.trim()) stepErrors.donorPhone = "Phone number is required"
        break

      case 2: // Donation Details
        if (!data.donationType) stepErrors.donationType = "Please select a donation type"
        if (data.donationType === "monetary") {
          if (!data.monetaryAmount) {
            stepErrors.monetaryAmount = "Please enter a donation amount"
          } else if (parseFloat(data.monetaryAmount) <= 0) {
            stepErrors.monetaryAmount = "Donation amount must be greater than 0"
          }
        }
        if (data.donationType === "items") {
          if (!data.itemCategory) stepErrors.itemCategory = "Please select an item category"
          if (!data.itemDescription.trim()) stepErrors.itemDescription = "Please describe the items"
          if (!data.itemCondition) stepErrors.itemCondition = "Please select item condition"
          if (!data.deliveryMethod) stepErrors.deliveryMethod = "Please select a delivery method"
        }
        break

      case 3: // Review & Submit
        if (!data.agreeToTerms) stepErrors.agreeToTerms = "You must agree to the terms and conditions"
        break
    }

    return stepErrors
  }, [])

  const nextStep = useCallback(() => {
    const stepErrors = validateStep(currentStep, formData)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }

    setErrors({})
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }, [currentStep, formData, validateStep])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setErrors({})
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault()

      const stepErrors = validateStep(3, formData)
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors)
        return
      }

      setIsLoading(true)

      try {
        // Check if user is authenticated
        if (!user || !user.id) {
          throw new Error('You must be logged in to make a donation');
        }

        // Validate orphanage ID
        if (!formData.orphanageId) {
          throw new Error('Please select an orphanage for your donation');
        }

        // Map frontend donation type to backend enum
        let backendDonationType;
        if (formData.donationType === 'monetary') {
          backendDonationType = 'CASH';
        } else if (formData.donationType === 'items') {
          backendDonationType = 'KIND';
        } else {
          throw new Error('Invalid donation type');
        }

        // Prepare appointment date (use preferred date if provided)
        let appointmentDate = null;
        if (formData.preferredDate) {
          appointmentDate = new Date(formData.preferredDate).toISOString();
        }

        // Prepare donation data for backend (matching CreateDonationRequest structure)
        const donationData = {
          clientId: user.id, // Current logged-in user's ID
          orphanageId: formData.orphanageId, // UUID of selected orphanage
          donationType: backendDonationType, // CASH, KIND, or BOTH
          appointmentDate: appointmentDate, // ISO string or null
          cashAmount: formData.donationType === 'monetary' ? parseFloat(formData.monetaryAmount) || 0 : null,
          itemDescription: formData.donationType === 'items' ?
            `${formData.itemCategory || 'Items'}: ${formData.itemDescription || 'No description'}${formData.itemQuantity ? ` (Quantity: ${formData.itemQuantity})` : ''}${formData.itemCondition ? ` (Condition: ${formData.itemCondition})` : ''}`
            : null
        }

        console.log("Submitting donation data:", donationData)

        // Submit to backend API
        const response = await apiService.createDonation(donationData)
        console.log("Donation submitted successfully:", response)

        // Set submission success
        setIsSubmitted(true)
      } catch (error) {
        console.error("Donation submission failed:", error)
        setErrors({
          submit: error.message || "There was an error submitting your donation. Please try again."
        })
      } finally {
        setIsLoading(false)
      }
    },
    [formData, validateStep],
  )

  const resetForm = useCallback(() => {
    setFormData({
      donorName: "",
      donorEmail: "",
      donorPhone: "",
      donorAddress: "",
      orphanageId: "",
      orphanageName: "",
      orphanageContact: "",
      location: "",
      donationType: "",
      monetaryAmount: "",
      itemCategory: "",
      itemDescription: "",
      itemQuantity: "",
      itemCondition: "",
      urgencyLevel: "",
      deliveryMethod: "",
      preferredDate: "",
      message: "",
      agreeToTerms: false,
      allowContact: false,
      isAnonymous: false,
    })
    setCurrentStep(1)
    setErrors({})
    setIsSubmitted(false)
  }, [])

  const isStepValid = useCallback(
    (step) => {
      return Object.keys(validateStep(step, formData)).length === 0
    },
    [formData, validateStep],
  )

  // Initialize form data with user information if logged in
  const initializeFormData = useCallback((initialData = null) => {
    if (initialData) {
      // If initial data is provided, use it
      setFormData(prev => ({
        ...prev,
        ...initialData
      }))
    } else if (user) {
      // Otherwise, auto-fill from user context
      updateFormData("donorName", user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || "");
      updateFormData("donorEmail", user.email || "");
      updateFormData("donorPhone", user.phone || "");
    }
  }, [user, updateFormData]);

  return {
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
  }
}

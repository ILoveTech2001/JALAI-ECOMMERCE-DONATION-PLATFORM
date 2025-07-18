"use client"

import { useState, useCallback } from "react"

export function useDonationForm() {
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

  const nextStep = useCallback(() => {
    const stepErrors = validateStep(currentStep, formData)

    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, 4))
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      setErrors(stepErrors)
    }
  }, [currentStep, formData])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const validateStep = (step, data) => {
    const stepErrors = {}

    switch (step) {
      case 1: // Donor Information
        if (!data.donorName.trim()) stepErrors.donorName = "Name is required"
        if (!data.donorEmail.trim()) {
          stepErrors.donorEmail = "Email is required"
        } else if (!/^\S+@\S+\.\S+$/.test(data.donorEmail)) {
          stepErrors.donorEmail = "Please enter a valid email address"
        }
        if (!data.donorPhone.trim()) {
          stepErrors.donorPhone = "Phone number is required"
        }
        break

      case 2: // Orphanage Information
        if (!data.location) stepErrors.location = "Location is required"
        if (!data.orphanageId) stepErrors.orphanageName = "Please select an orphanage"
        break

      case 3: // Donation Details
        if (!data.donationType) {
          stepErrors.donationType = "Please select a donation type"
        } else if (data.donationType === "monetary") {
          if (!data.monetaryAmount) {
            stepErrors.monetaryAmount = "Amount is required"
          } else if (isNaN(data.monetaryAmount) || Number.parseFloat(data.monetaryAmount) <= 0) {
            stepErrors.monetaryAmount = "Please enter a valid amount"
          }
        } else if (data.donationType === "items") {
          if (!data.itemCategory) stepErrors.itemCategory = "Category is required"
          if (!data.itemDescription.trim()) stepErrors.itemDescription = "Description is required"
        }
        break

      case 4: // Review & Submit
        if (!data.agreeToTerms) stepErrors.agreeToTerms = "You must agree to the terms"
        break
    }

    return stepErrors
  }

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault()

      const stepErrors = validateStep(4, formData)
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors)
        return
      }

      setIsLoading(true)

      try {
        // Simulate donation submission with a delay
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Log the submission data
        console.log("Donation submitted:", formData)

        // Set submission success
        setIsSubmitted(true)
      } catch (error) {
        console.error("Donation submission failed:", error)
        setErrors({ submit: "There was an error submitting your donation. Please try again." })
      } finally {
        setIsLoading(false)
      }
    },
    [formData],
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
    [formData],
  )

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
  }
}

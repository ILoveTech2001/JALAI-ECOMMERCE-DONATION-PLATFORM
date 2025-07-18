"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { forwardRef } from "react"

export const FormField = forwardRef(function FormField(
  {
    id,
    label,
    type = "text",
    placeholder,
    icon: Icon,
    rightElement,
    className = "",
    required = false,
    isTextarea = false,
    rows = 4,
    error,
    ...props
  },
  ref,
) {
  const InputComponent = isTextarea ? Textarea : Input

  return (
    <div className={`space-y-2 animate-in slide-in-from-left-5 duration-1000 delay-300 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium text-green-700 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-green-500" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        {!isTextarea && Icon && (
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
        )}
        <InputComponent
          ref={ref}
          id={id}
          type={type}
          placeholder={placeholder}
          className={`${!isTextarea && Icon ? "pl-12" : "pl-4"} pr-4 py-3 border ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200/40"
              : "border-green-200/60 focus:border-green-400/60 focus:ring-2 focus:ring-green-200/40"
          } transition-all duration-500 hover:border-green-300/60 bg-white/80 backdrop-blur-sm rounded-2xl text-green-800 placeholder:text-green-400 ${
            isTextarea ? "min-h-[100px] resize-none" : ""
          }`}
          required={required}
          rows={isTextarea ? rows : undefined}
          style={rightElement ? { paddingRight: "3rem" } : {}}
          {...props}
        />
        {rightElement && <div className="absolute right-4 top-1/2 transform -translate-y-1/2">{rightElement}</div>}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
})

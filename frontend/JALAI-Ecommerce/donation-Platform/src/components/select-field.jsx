import React from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SelectField({
  id,
  label,
  placeholder,
  options,
  icon: Icon,
  className = "",
  required = false,
  value,
  onValueChange,
  error,
}) {
  return (
    <div className={`space-y-2 animate-in slide-in-from-left-5 duration-1000 delay-300 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium text-green-700 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-green-500" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={`border ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200/40"
              : "border-green-200/60 focus:border-green-400/60 focus:ring-2 focus:ring-green-200/40"
          } transition-all duration-500 hover:border-green-300/60 bg-white/80 backdrop-blur-sm rounded-2xl text-green-800 py-3`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white/95 backdrop-blur-sm border border-green-200/60 rounded-2xl">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-green-800 focus:bg-green-50/50">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

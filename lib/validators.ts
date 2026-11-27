import { z } from "zod"

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
  .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")

export const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const signUpSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: passwordSchema,
  role: z.enum(["customer", "technician"], {
    error: "Please select a role",
  }),
})

export const repairRequestSchema = z.object({
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  preferredDate: z
    .string()
    .min(1, "Preferred date is required")
    .refine((val) => {
      const d = new Date(val)
      if (Number.isNaN(d.getTime())) return false
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      d.setHours(0, 0, 0, 0)
      return d >= today
    }, "Preferred date must be today or a future date"),
  problemDescription: z
    .string()
    .min(20, "Problem description must be at least 20 characters"),
})

const bangladeshPhonePattern = /^(?:\+8801\d{9}|01\d{9})$/

export function normalizePhoneNumber(value: string) {
  return value.replace(/[\s-]/g, "")
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or less"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required")
    .refine(
      (value) => bangladeshPhonePattern.test(value.replace(/[\s-]/g, "")),
      "Enter a valid Bangladeshi phone number (+8801XXXXXXXXX or 01XXXXXXXXX)"
    ),
  address: z.string().trim().max(300, "Address must be 300 characters or less"),
  avatar: z
    .string()
    .trim()
    .max(1000, "Avatar URL is too long")
    .refine((value) => value === "" || isHttpUrl(value), "Enter a valid avatar URL"),
})

export const serviceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  duration: z.string().optional().or(z.literal("")),
  serviceMode: z.string().min(1, "Service mode is required"),
  area: z.string().optional().or(z.literal("")),
})

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
export type RepairRequestValues = z.infer<typeof repairRequestSchema>
export type ProfileValues = z.infer<typeof profileSchema>
export type ServiceValues = z.infer<typeof serviceSchema>

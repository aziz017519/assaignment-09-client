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
    required_error: "Please select a role",
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

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional().or(z.literal("")),
  area: z.string().optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
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

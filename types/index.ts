export type Role = "customer" | "technician" | "admin"

export type BookingStatus =
  | "requested"
  | "accepted"
  | "in-progress"
  | "completed"
  | "rejected"
  | "cancelled"

export type PaymentStatus = "unpaid" | "paid"

export type ApprovalStatus = "pending" | "approved" | "rejected"

export type ServiceMode = "home" | "shop" | "online"

export type Plan = "free" | "pro"

export interface User {
  id: string
  name: string
  email: string
  image?: string | null
  /** API alias for image, used by the shared profile form. */
  avatar?: string | null
  role: Role
  phone?: string | null
  address?: string | null
  area?: string | null
  bio?: string | null
  // Technician-only subscription fields; customers and admins ignore them.
  plan?: Plan
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  planExpiresAt?: string | null
  createdAt?: string
}

export interface ServiceTechnician {
  _id?: string
  id?: string
  name?: string
  email?: string
  image?: string | null
  area?: string
  bio?: string
}

export interface Service {
  _id: string
  id?: string
  title: string
  description: string
  category: string
  // Express API returns `basePrice`; older shapes may use `price`.
  basePrice?: number | string | null
  price?: number | string | null
  startingPrice?: number | string | null
  minPrice?: number | string | null
  pricing?: { amount?: number | string | null }
  duration?: string
  estimatedDuration?: string
  estimatedTime?: string
  durationMinutes?: number
  serviceMode: ServiceMode | string
  area?: string
  serviceArea?: string
  location?: string
  coverageArea?: string
  image: string
  available?: boolean
  isAvailable?: boolean
  approvalStatus: ApprovalStatus
  technicianName?: string
  technicianEmail?: string
  provider?: ServiceTechnician
  technician?: ServiceTechnician
  createdAt?: string
}

export interface Booking {
  _id: string
  id?: string
  serviceTitle?: string
  service?: Service | { _id: string; title: string; image?: string; price?: number; category?: string }
  image?: string | null
  imageUrl?: string | null
  serviceImage?: string | null
  customer?: User | { _id: string; name: string; email?: string }
  technician?: { name?: string; email?: string; image?: string | null } | User
  technicianName?: string
  technicianEmail?: string
  status: BookingStatus
  paymentStatus: PaymentStatus
  phone?: string
  address?: string
  preferredDate?: string
  problemDescription?: string
  price?: number | string | null
  basePrice?: number | string | null
  finalAmount?: number | string | null
  createdAt?: string
}

export interface Payment {
  // The API returns `id`; older/admin rows may still expose `_id`.
  id?: string
  _id?: string
  // Booking rows keep a bookingId; subscription rows keep userId/stripeInvoiceId.
  bookingId?: string | null
  userId?: string | null
  type?: "booking" | "subscription"
  amount: number
  currency?: string
  stripeInvoiceId?: string | null
  stripeSessionId?: string | null
  transactionId?: string | null
  receiptUrl?: string | null
  paymentStatus?: "paid" | "unpaid" | "failed"
  status?: "paid" | "unpaid" | "failed" | "pending"
  paidAt?: string
  createdAt?: string
  customer?: { name: string; email?: string }
  service?: { title: string }
  serviceTitle?: string
  technicianName?: string
  technicianEmail?: string
}

export type PaymentVerificationStatus = "paid" | "pending" | "failed"
export type PaymentVerificationType = "booking" | "subscription"

export interface PaymentVerificationResult {
  status: PaymentVerificationStatus
  type: PaymentVerificationType
  transactionId: string | null
  sessionId: string
  amount: number
  currency: string
  paymentMethod: string
  paidAt: string | null
  receiptUrl: string | null
  booking?: {
    id: string
    ticketId: string
    serviceTitle: string
    technicianName: string
    preferredDate: string | null
    address: string
  }
  subscription?: {
    plan: "pro"
    renewalDate: string | null
    interval: string
  }
}

export interface SubscriptionStatus {
  plan: Plan
  planExpiresAt: string | null
  serviceCount: number
  serviceLimit: number | null
  hasSubscription: boolean
  price: { amount: number; currency: string; interval: string } | null
}

export interface TechnicianPayment {
  id: string
  type: "booking" | "subscription"
  label: string
  amount: number
  currency: string
  status: string
  createdAt: string | null
  transactionId: string | null
  receiptUrl?: string | null
}

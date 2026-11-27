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
  /** Rating summary returned by the public services endpoints. */
  averageRating?: number | string | null
  ratingCount?: number | string | null
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
  customerName?: string
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
  rating?: number | string | null
  review?: string | null
  reviewedAt?: string | null
  canReview?: boolean
}

export interface ServiceReview {
  rating: number
  review?: string | null
  reviewedAt?: string | null
  customerName?: string
}

export interface ReviewResult {
  rating: number
  review?: string | null
  reviewedAt?: string | null
  service?: {
    averageRating?: number | string | null
    ratingCount?: number | string | null
  }
}

export interface Payment {
  // The API returns `id`; older/admin rows may still expose `_id`.
  id?: string
  _id?: string
  // Booking rows keep a bookingId.
  bookingId?: string | null
  amount: number
  currency?: string
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

export interface PaymentVerificationResult {
  status: PaymentVerificationStatus
  type: "booking"
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
}

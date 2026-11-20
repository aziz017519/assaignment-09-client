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
  role: Role
  phone?: string | null
  area?: string | null
  bio?: string | null
  createdAt?: string
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
  serviceMode: ServiceMode | string
  area?: string
  image: string
  available?: boolean
  approvalStatus: ApprovalStatus
  technicianName?: string
  provider?: { name?: string }
  technician?: {
    _id?: string
    name: string
    email?: string
    image?: string | null
    area?: string
    bio?: string
  }
  createdAt?: string
}

export interface Booking {
  _id: string
  id?: string
  service?: Service | { _id: string; title: string; image?: string; price?: number; category?: string }
  customer?: User | { _id: string; name: string; email?: string }
  technician?: User | { _id: string; name: string; email?: string }
  status: BookingStatus
  paymentStatus: PaymentStatus
  phone?: string
  address?: string
  preferredDate?: string
  problemDescription?: string
  finalAmount?: number
  createdAt?: string
}

export interface Payment {
  _id: string
  bookingId: string
  amount: number
  transactionId: string
  status: "paid" | "failed"
  createdAt?: string
  customer?: { name: string; email?: string }
  service?: { title: string }
}

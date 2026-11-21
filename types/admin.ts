import type { ApprovalStatus, BookingStatus, Role } from "@/types"

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AdminTransactionSummary {
  totalRevenue: number
  successful: number
  pending: number
  failed: number
}

export interface AdminMeta extends PaginationMeta {
  summary?: AdminTransactionSummary
}

export interface AdminListResponse<T> {
  success: boolean
  data: T[]
  meta?: AdminMeta
}

export interface AdminUser {
  id: string
  name: string
  email: string
  image?: string | null
  avatar?: string | null
  role: Role
  emailVerified: boolean
  phone?: string | null
  address?: string | null
  area?: string | null
  createdAt?: string | null
}

export interface AdminService {
  id: string
  title: string
  category: string
  technicianName?: string | null
  technicianEmail?: string | null
  price: number
  status: ApprovalStatus
  approvalStatus: ApprovalStatus
  isAvailable: boolean
  image?: string | null
  createdAt?: string | null
}

export interface AdminBooking {
  id: string
  ticketId?: string | null
  customerName: string
  customerEmail?: string | null
  technicianName?: string | null
  technicianEmail?: string | null
  serviceTitle: string
  category?: string | null
  status: BookingStatus
  preferredDate?: string | null
  price: number
  basePrice?: number
  paymentStatus?: string | null
  createdAt?: string | null
}

export interface AdminTransaction {
  id: string
  transactionId: string | null
  customerName: string | null
  customerEmail: string | null
  bookingId: string | null
  serviceTitle: string | null
  type: "booking" | "subscription"
  amount: number
  currency: string
  status: string
  date: string | null
  createdAt: string | null
  receiptUrl?: string | null
}

export type AdminFilterKey =
  | "search"
  | "role"
  | "status"
  | "category"
  | "from"
  | "to"
  | "sort"
  | "page"
  | "method"

export interface AdminFilterState {
  search?: string
  role?: string
  status?: string
  category?: string
  from?: string
  to?: string
  sort?: string
  page?: string
  method?: string
}

export const ADMIN_USER_ROLES = ["customer", "technician", "admin"] as const
export const ADMIN_APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const
export const ADMIN_BOOKING_STATUSES = [
  "requested",
  "accepted",
  "rejected",
  "in-progress",
  "completed",
  "cancelled",
] as const
export const ADMIN_SERVICE_CATEGORIES = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
] as const
export const ADMIN_TRANSACTION_TYPES = ["booking", "subscription"] as const

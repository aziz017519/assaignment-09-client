export const CATEGORIES = [
  "AC Repair",
  "Refrigerator",
  "Washing Machine",
  "TV & Display",
  "Computer & Laptop",
  "Mobile Phone",
  "Microwave & Oven",
  "Plumbing",
  "Electrical",
  "Other",
] as const

export const SERVICE_MODES = ["home", "shop", "online"] as const

export const BOOKING_STATUSES = [
  "requested",
  "accepted",
  "in-progress",
  "completed",
  "rejected",
  "cancelled",
] as const

export const BOOKING_STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  requested: { label: "Requested", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  accepted: { label: "Accepted", className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" },
  "in-progress": { label: "In Progress", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  completed: { label: "Completed", className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
}

export const PAYMENT_STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  unpaid: { label: "Unpaid", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  paid: { label: "Paid", className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  failed: { label: "Failed", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  refunded: { label: "Refunded", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
}

export const APPROVAL_STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  approved: { label: "Approved", className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
}

export function dashboardPathForRole(role?: string | null) {
  switch (role) {
    case "admin":
      return "/dashboard/admin"
    case "technician":
      return "/dashboard/technician"
    default:
      return "/dashboard/customer"
  }
}

export function profilePathForRole(role?: string | null) {
  switch (role) {
    case "admin":
      return "/dashboard/admin/profile"
    case "technician":
      return "/dashboard/technician/profile"
    default:
      return "/dashboard/customer/profile"
  }
}

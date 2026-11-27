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
  requested: { label: "Requested", className: "bg-info/15 text-info" },
  accepted: { label: "Accepted", className: "bg-info/15 text-info" },
  "in-progress": { label: "In Progress", className: "bg-warning/15 text-warning" },
  completed: { label: "Completed", className: "bg-success/15 text-success" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive dark:bg-destructive/20" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
}

export const PAYMENT_STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  unpaid: { label: "Unpaid", className: "bg-warning/15 text-warning" },
  pending: { label: "Pending", className: "bg-warning/15 text-warning" },
  paid: { label: "Paid", className: "bg-success/15 text-success" },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive dark:bg-destructive/20" },
  refunded: { label: "Refunded", className: "bg-destructive/10 text-destructive dark:bg-destructive/20" },
}

export const APPROVAL_STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "bg-warning/15 text-warning" },
  approved: { label: "Approved", className: "bg-success/15 text-success" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive dark:bg-destructive/20" },
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

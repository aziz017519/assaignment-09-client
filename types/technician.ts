export type TechnicianRequestStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in-progress"
  | "completed"
  | "cancelled"

export interface TechnicianStatusCount {
  status: TechnicianRequestStatus
  count: number
}

export interface TechnicianMonthPoint {
  label: string
  requested: number
  completed: number
  cancelled: number
}

export interface TechnicianStats {
  totalServices: number
  serviceLimit: number | null
  approvedServices: number
  pendingServices: number
  pendingRequests: number
  acceptedRequests: number
  completedRequests: number
  cancelledRequests: number
  totalEarnings: number
  requestsByStatus: TechnicianStatusCount[]
  requestsByMonth: TechnicianMonthPoint[]
}

export interface TechnicianStatsResponse {
  success: boolean
  data: TechnicianStats
}

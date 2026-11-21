const TECHNICIAN_DATA_CHANGED_EVENT = "fixmate:technician-data-changed"

/** Notify mounted technician pages that services or request statuses changed. */
export function dispatchTechnicianDataChanged() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(TECHNICIAN_DATA_CHANGED_EVENT))
}

export function onTechnicianDataChange(handler: () => void) {
  if (typeof window === "undefined") return () => {}
  window.addEventListener(TECHNICIAN_DATA_CHANGED_EVENT, handler)
  return () => window.removeEventListener(TECHNICIAN_DATA_CHANGED_EVENT, handler)
}

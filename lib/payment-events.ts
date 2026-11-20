import type { PaymentVerificationType } from "@/types"

export const PAYMENT_CONFIRMED_EVENT = "fixmate:payment-confirmed"

export type PaymentConfirmedDetail = {
  type: PaymentVerificationType
}

export function dispatchPaymentConfirmed(type: PaymentVerificationType) {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent<PaymentConfirmedDetail>(PAYMENT_CONFIRMED_EVENT, { detail: { type } })
  )
}

export function onPaymentConfirmed(
  handler: (detail: PaymentConfirmedDetail) => void
) {
  if (typeof window === "undefined") return () => {}
  const listener = (event: Event) => {
    const detail = (event as CustomEvent<PaymentConfirmedDetail>).detail
    if (detail?.type) handler(detail)
  }
  window.addEventListener(PAYMENT_CONFIRMED_EVENT, listener)
  return () => window.removeEventListener(PAYMENT_CONFIRMED_EVENT, listener)
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

function dashboardPathForRole(role?: string | null) {
  switch (role) {
    case "admin":
      return "/dashboard/admin"
    case "technician":
      return "/dashboard/technician"
    default:
      return "/dashboard/customer"
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")
  const isDashboard = pathname.startsWith("/dashboard")
  const isPayment = pathname.startsWith("/payment")

  if (!isAuthPage && !isDashboard && !isPayment) {
    return NextResponse.next()
  }

  try {
    const sessionRes = await fetch(new URL("/api/auth/get-session", request.url), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    })
    const session = sessionRes.ok ? await sessionRes.json() : null
    const user = session?.user as { role?: string } | undefined

    if (!user && (isDashboard || isPayment)) {
      const signInUrl = new URL("/sign-in", request.url)
      signInUrl.searchParams.set("redirect", `${pathname}${search}`)
      return NextResponse.redirect(signInUrl)
    }

    if (user && isAuthPage) {
      const redirect = request.nextUrl.searchParams.get("redirect")
      const target =
        redirect && redirect.startsWith("/") ? redirect : dashboardPathForRole(user.role)
      return NextResponse.redirect(new URL(target, request.url))
    }

    if (user && isDashboard) {
      const role = user.role || "customer"
      if (pathname.startsWith("/dashboard/customer") && role !== "customer") {
        return NextResponse.redirect(new URL(dashboardPathForRole(role), request.url))
      }
      if (pathname.startsWith("/dashboard/technician") && role !== "technician") {
        return NextResponse.redirect(new URL(dashboardPathForRole(role), request.url))
      }
      if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
        return NextResponse.redirect(new URL(dashboardPathForRole(role), request.url))
      }
      // The Pro subscription page is technician-only.
      if (pathname.startsWith("/dashboard/subscription") && role !== "technician") {
        return NextResponse.redirect(new URL(dashboardPathForRole(role), request.url))
      }
      // /dashboard/profile is allowed for any logged-in user
    }

    if (user && isPayment && user.role !== "customer") {
      return NextResponse.redirect(new URL(dashboardPathForRole(user.role), request.url))
    }

    return NextResponse.next()
  } catch {
    if (isDashboard || isPayment) {
      const signInUrl = new URL("/sign-in", request.url)
      signInUrl.searchParams.set("redirect", `${pathname}${search}`)
      return NextResponse.redirect(signInUrl)
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up", "/payment/:path*"],
}

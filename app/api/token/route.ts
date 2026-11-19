import { headers } from "next/headers"
import { SignJWT } from "jose"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

const TOKEN_TTL_SECONDS = 5 * 60

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    const email = session?.user?.email
    if (!email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }

    const secret = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET
    if (!secret) {
      return Response.json({ error: "Auth secret is not configured" }, { status: 500 })
    }

    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(email)
      .setIssuedAt()
      .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
      .sign(new TextEncoder().encode(secret))

    return Response.json({ token, expiresIn: TOKEN_TTL_SECONDS }, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch {
    return Response.json({ error: "Unable to issue API token" }, { status: 500 })
  }
}

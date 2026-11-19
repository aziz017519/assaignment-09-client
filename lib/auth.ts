import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

// const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/database"
const client = new MongoClient(process.env.BETTER_AUTH_DB_URI as string )
const db = client.db("fixmate")

export const auth = betterAuth({
  appName: "FixMate",
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        required: false,
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      area: {
        type: "string",
        required: false,
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
})
"use client"

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { api, clearApiToken } from "@/lib/api"
import type {
  AdminFilterKey,
  AdminFilterState,
  AdminMeta,
  AdminTransactionSummary,
} from "@/types/admin"

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400
const LOCATION_EVENT = "admin:location-change"

function subscribeToLocation(onChange: () => void) {
  if (typeof window === "undefined") return () => {}
  window.addEventListener("popstate", onChange)
  window.addEventListener(LOCATION_EVENT, onChange)
  return () => {
    window.removeEventListener("popstate", onChange)
    window.removeEventListener(LOCATION_EVENT, onChange)
  }
}

function getSearchSnapshot() {
  return typeof window === "undefined" ? "" : window.location.search
}

function getServerSearchSnapshot() {
  return ""
}

function unwrapList<T>(body: unknown): { rows: T[]; meta?: AdminMeta } {
  const envelope = body && typeof body === "object" ? (body as Record<string, unknown>) : {}
  const raw = "data" in envelope ? envelope.data : body
  return {
    rows: Array.isArray(raw) ? (raw as T[]) : [],
    meta: envelope.meta as AdminMeta | undefined,
  }
}

export function useAdminList<T>(endpoint: string) {
  // `useSearchParams` makes Next.js suspend the whole route during development.
  // Reading window.location keeps filters in the URL without a Suspense boundary.
  const paramsString = useSyncExternalStore(
    subscribeToLocation,
    getSearchSnapshot,
    getServerSearchSnapshot
  )

  const filters = useMemo<AdminFilterState>(() => {
    const params = new URLSearchParams(paramsString)
    const read = (key: string) => params.get(key) || undefined
    return {
      search: read("search"),
      role: read("role"),
      status: read("status"),
      category: read("category"),
      from: read("from"),
      to: read("to"),
      sort: read("sort") || "newest",
      page: read("page") || "1",
      method: read("method"),
    }
  }, [paramsString])

  const [rows, setRows] = useState<T[]>([])
  const [meta, setMeta] = useState<AdminMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [searchInput, setSearchInput] = useState(filters.search ?? "")

  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => {
      if (active) setSearchInput(filters.search ?? "")
    })
    return () => {
      active = false
    }
  }, [filters.search])

  const setFilter = useCallback((key: AdminFilterKey, value: string | null | undefined) => {
    if (typeof window === "undefined") return
    const next = new URLSearchParams(window.location.search)
    if (value === null || value === undefined || value === "") next.delete(key)
    else next.set(key, value)
    if (key !== "page") next.delete("page")
    const query = next.toString()
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
    window.history.replaceState(window.history.state, "", url)
    window.dispatchEvent(new Event(LOCATION_EVENT))
  }, [])

  useEffect(() => {
    if (searchInput === (filters.search ?? "")) return
    const timer = window.setTimeout(() => {
      setFilter("search", searchInput.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput, filters.search, setFilter])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(filters)) {
        if (value) params.set(key, value)
      }
      params.set("limit", String(PAGE_SIZE))
      const query = params.toString()
      const body = await api.get<unknown>(`${endpoint}${query ? `?${query}` : ""}`)
      const result = unwrapList<T>(body)
      setRows(result.rows)
      setMeta(result.meta ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load data.")
    } finally {
      setLoading(false)
    }
  }, [endpoint, filters])

  useEffect(() => {
    let active = true
    // Defer state updates out of the effect body to avoid cascading renders.
    void Promise.resolve().then(() => {
      if (active) void load()
    })
    return () => {
      active = false
    }
  }, [load, reloadKey])

  const retry = useCallback(() => {
    clearApiToken()
    setReloadKey((key) => key + 1)
  }, [])

  return {
    rows,
    meta,
    summary: meta?.summary as AdminTransactionSummary | undefined,
    loading,
    error,
    filters,
    searchInput,
    setSearchInput,
    setFilter,
    retry,
  }
}

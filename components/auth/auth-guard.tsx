"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

const publicPaths = ["/login", "/register"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated && !publicPaths.includes(pathname)) {
      router.push("/login")
    } else if (isAuthenticated && publicPaths.includes(pathname)) {
      router.push("/")
    }
  }, [isAuthenticated, pathname, router])

  // Don't render anything during the authentication check
  if (!isAuthenticated && !publicPaths.includes(pathname)) {
    return null
  }

  return <>{children}</>
}


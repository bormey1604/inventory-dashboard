"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { useSidebar } from "./sidebar-provider"
import { ModeToggle } from "./mode-toggle"
import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserNav } from "./user-nav"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isOpen, toggle, isMobile } = useSidebar()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div
        className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${
          isOpen && !isMobile ? "ml-0" : "ml-0 w-full"
        }`}
      >
        <header className="h-16 border-b flex items-center px-4 sticky top-0 bg-background z-10">
          <Button variant="ghost" size="icon" onClick={toggle} className="mr-4">
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <h1 className="text-xl font-semibold flex-1"></h1>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}


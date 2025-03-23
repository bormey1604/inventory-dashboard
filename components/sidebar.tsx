"use client"

import { useSidebar } from "./sidebar-provider"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, Tags, ShoppingCart, ChevronLeft, ChevronRight, FileText } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const { isOpen, toggle, isMobile } = useSidebar()
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      active: pathname === "/",
    },
    {
      label: "Inventory",
      icon: Package,
      href: "/inventory",
      active: pathname === "/inventory",
    },
    {
      label: "Categories",
      icon: Tags,
      href: "/categories",
      active: pathname === "/categories",
    },
    {
      label: "Sales",
      icon: ShoppingCart,
      href: "/sales",
      active: pathname === "/sales",
    },
    {
      label: "Invoices",
      icon: FileText,
      href: "/invoices",
      active: pathname.startsWith("/invoices"),
    },
  ]

  if (isMobile && !isOpen) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full w-56 flex-col border-r bg-background transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isMobile ? "absolute" : "relative",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <h2 className="text-lg font-semibold">ShopHub</h2>
        <Button variant="ghost" size="icon" onClick={toggle} className="md:hidden">
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <route.icon className="h-5 w-5" />
              <span>{route.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      {!isMobile && (
        <div className="border-t p-4">
          <Button variant="outline" size="icon" onClick={toggle} className="ml-auto">
            {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>
      )}
    </div>
  )
}


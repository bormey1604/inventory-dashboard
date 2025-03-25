"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, FileText, Printer, Download, Calendar } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"

interface Sale {
  saleId: string
  customerId: string
  saleItems: SaleItem[]
  totalAmount: number
  discountPercentage: number
  finalAmount: number
  paymentMethod: string
  createdAt: string
  updatedAt: string
}

interface SaleItem {
  productId: string
  quantity: number
  price: number
}

interface Product {
  id: string
  name: string
  price: number
  description: string
  stock: number
  categoryId: string
}

type DateFilter = "all" | "today" | "yesterday" | "thisWeek" | "thisMonth" | "custom"

export function InvoicesContent() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    async function fetchData() {
      try {
        const [salesRes, productsRes] = await Promise.all([
          fetch("http://localhost:8080/api/v1/sales"),
          fetch("http://localhost:8080/api/v1/products"),
        ])

        const salesData = await salesRes.json()
        const productsData = await productsRes.json()

        setSales(salesData)
        setProducts(productsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    return product ? product.name : "Unknown Product"
  }

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case "today":
        return "Today"
      case "yesterday":
        return "Yesterday"
      case "thisWeek":
        return "This Week"
      case "thisMonth":
        return "This Month"
      case "custom":
        return customDate ? format(customDate, "PP") : "Select Date"
      default:
        return "All Dates"
    }
  }

  const handleDateFilterChange = (filter: DateFilter) => {
    setDateFilter(filter)
    if (filter !== "custom") {
      setCustomDate(undefined)
    }
  }

  const filteredSales = sales.filter((sale) => {
    // Text search filter
    const matchesSearch =
      sale.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.saleId.toLowerCase().includes(searchTerm.toLowerCase())

    // Date filter
    if (dateFilter === "all") {
      return matchesSearch
    }

    const saleDate = new Date(sale.createdAt)
    const today = new Date()

    switch (dateFilter) {
      case "today":
        return matchesSearch && saleDate >= startOfDay(today) && saleDate <= endOfDay(today)

      case "yesterday":
        const yesterday = subDays(today, 1)
        return matchesSearch && saleDate >= startOfDay(yesterday) && saleDate <= endOfDay(yesterday)

      case "thisWeek":
        return (
          matchesSearch &&
          saleDate >= startOfWeek(today, { weekStartsOn: 1 }) &&
          saleDate <= endOfWeek(today, { weekStartsOn: 1 })
        )

      case "thisMonth":
        return matchesSearch && saleDate >= startOfMonth(today) && saleDate <= endOfMonth(today)

      case "custom":
        if (!customDate) return matchesSearch
        return matchesSearch && saleDate >= startOfDay(customDate) && saleDate <= endOfDay(customDate)

      default:
        return matchesSearch
    }
  })

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading invoices data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by customer ID or invoice number..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <Calendar className="mr-2 h-4 w-4" />
                {getDateFilterLabel()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 max-h-[300px] overflow-y-auto" align="start">
              <div className="p-2 grid gap-1">
                <Button
                  variant={dateFilter === "all" ? "default" : "ghost"}
                  className="justify-start font-normal"
                  onClick={() => handleDateFilterChange("all")}
                >
                  All Dates
                </Button>
                <Button
                  variant={dateFilter === "today" ? "default" : "ghost"}
                  className="justify-start font-normal"
                  onClick={() => handleDateFilterChange("today")}
                >
                  Today
                </Button>
                <Button
                  variant={dateFilter === "yesterday" ? "default" : "ghost"}
                  className="justify-start font-normal"
                  onClick={() => handleDateFilterChange("yesterday")}
                >
                  Yesterday
                </Button>
                <Button
                  variant={dateFilter === "thisWeek" ? "default" : "ghost"}
                  className="justify-start font-normal"
                  onClick={() => handleDateFilterChange("thisWeek")}
                >
                  This Week
                </Button>
                <Button
                  variant={dateFilter === "thisMonth" ? "default" : "ghost"}
                  className="justify-start font-normal"
                  onClick={() => handleDateFilterChange("thisMonth")}
                >
                  This Month
                </Button>
                <Button
                  variant={dateFilter === "custom" ? "default" : "ghost"}
                  className="justify-start font-normal"
                  onClick={() => handleDateFilterChange("custom")}
                >
                  Specific Date
                </Button>

                {dateFilter === "custom" && (
                  <div className="border-t pt-2 mt-2 overflow-visible">
                    <CalendarComponent mode="single" selected={customDate} onSelect={setCustomDate} initialFocus />
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale) => (
                <TableRow key={sale.saleId}>
                  <TableCell className="font-medium">INV-{sale.saleId.substring(0, 8)}</TableCell>
                  <TableCell>{sale.customerId}</TableCell>
                  <TableCell>{formatDate(sale.createdAt)}</TableCell>
                  <TableCell>${sale.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Paid
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/invoices/${sale.saleId}`}>
                        <Button variant="outline" size="icon" title="View Invoice">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Print Invoice"
                        onClick={() => {
                          toast({
                            title: "Print initiated",
                            description: "The print dialog should open shortly.",
                          })
                          window.open(`/invoices/${sale.saleId}/print`, "_blank")
                        }}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Download PDF"
                        onClick={() => {
                          toast({
                            title: "Download started",
                            description: "Your invoice PDF is being generated.",
                          })
                          window.open(`/invoices/${sale.saleId}/download`, "_blank")
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}


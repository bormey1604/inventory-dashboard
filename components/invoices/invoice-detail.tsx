"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, Printer } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

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

export function InvoiceDetail({ id }: { id: string }) {
  const router = useRouter()
  const [sale, setSale] = useState<Sale | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // In a real app, you would fetch the specific invoice by ID
        // For demo purposes, we'll fetch all sales and find the one with matching ID
        const [salesRes, productsRes] = await Promise.all([
          fetch("http://localhost:8080/api/v1/sales"),
          fetch("http://localhost:8080/api/v1/products"),
        ])

        const salesData = await salesRes.json()
        const productsData = await productsRes.json()

        const foundSale = salesData.find((s: Sale) => s.saleId === id)

        if (foundSale) {
          setSale(foundSale)
        } else {
          toast({
            title: "Invoice not found",
            description: "The requested invoice could not be found.",
            variant: "destructive",
          })
          router.push("/invoices")
        }

        setProducts(productsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load invoice data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, router])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    return product ? product.name : "Unknown Product"
  }

  const handlePrint = () => {
    toast({
      title: "Print initiated",
      description: "The print dialog should open shortly.",
    })
    window.open(`/invoices/${id}/print`, "_blank")
  }

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Your invoice PDF is being generated.",
    })
    window.open(`/invoices/${id}/download`, "_blank")
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading invoice data...</div>
  }

  if (!sale) {
    return <div className="text-center">Invoice not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/invoices">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Invoice #{id.substring(0, 8)}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-8">
            <div className="flex justify-between">
              <div>
                <h3 className="text-2xl font-bold">INVOICE</h3>
                <p className="text-muted-foreground">INV-{id.substring(0, 8)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Your Company Name</p>
                <p className="text-sm text-muted-foreground">123 Business Street</p>
                <p className="text-sm text-muted-foreground">City, State 12345</p>
                <p className="text-sm text-muted-foreground">contact@yourcompany.com</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-semibold uppercase text-muted-foreground">Bill To</p>
                <p className="font-semibold">Customer ID: {sale.customerId}</p>
                <p className="text-sm text-muted-foreground">customer@example.com</p>
              </div>
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase text-muted-foreground">Invoice Date</p>
                    <p>{formatDate(sale.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase text-muted-foreground">Payment Method</p>
                    <p>{sale.paymentMethod}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-semibold">Item</th>
                      <th className="p-2 text-left font-semibold">Quantity</th>
                      <th className="p-2 text-left font-semibold">Unit Price</th>
                      <th className="p-2 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.saleItems.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{getProductName(item.productId)}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">${item.price.toFixed(2)}</td>
                        <td className="p-2 text-right">${(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p>${sale.totalAmount.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Discount ({sale.discountPercentage}%)</p>
                  <p>-${(sale.totalAmount * (sale.discountPercentage / 100)).toFixed(2)}</p>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <p>Total</p>
                  <p>${sale.finalAmount.toFixed(2)}</p>
                </div>
                <div className="rounded-md bg-green-50 p-2 text-center text-sm font-medium text-green-900 dark:bg-green-900/20 dark:text-green-300">
                  Paid
                </div>
              </div>
            </div>

            <div>
              <p className="font-semibold">Notes</p>
              <p className="text-sm text-muted-foreground">
                Thank you for your business. Please contact us if you have any questions about this invoice.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


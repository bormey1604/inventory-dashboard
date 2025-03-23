"use client"

import { useEffect, useState } from "react"
import { jsPDF } from "jspdf"
import { toast } from "@/components/ui/use-toast"
// Import jspdf-autotable properly
import autoTable from "jspdf-autotable"

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

export function InvoicePdfGenerator({ id }: { id: string }) {
  const [sale, setSale] = useState<Sale | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [productMap, setProductMap] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchData() {
      try {
        // First, fetch all the data we need
        const [salesRes, productsRes] = await Promise.all([
          fetch("http://localhost:8080/api/v1/sales"),
          fetch("http://localhost:8080/api/v1/products"),
        ])

        const salesData = await salesRes.json()
        const productsData = await productsRes.json()

        // Find the specific sale
        const foundSale = salesData.find((s: Sale) => s.saleId === id)

        if (!foundSale) {
          toast({
            title: "Invoice not found",
            description: "The requested invoice could not be found.",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        // Create a map of product IDs to product names for easy lookup
        const productNameMap: Record<string, string> = {}
        productsData.forEach((product: Product) => {
          productNameMap[product.id] = product.name
        })

        // Set all the state
        setSale(foundSale)
        setProducts(productsData)
        setProductMap(productNameMap)

        // Generate the PDF after all data is loaded and processed
        setTimeout(() => {
          generatePDF(foundSale, productNameMap)
          setLoading(false)
        }, 500)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to generate PDF. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const generatePDF = (sale: Sale, productMap: Record<string, string>) => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF()

      // Add company logo/header
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("INVOICE", 14, 20)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`INV-${sale.saleId.substring(0, 8)}`, 14, 26)

      // Company details
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("Your Company Name", 150, 20, { align: "right" })
      doc.setFont("helvetica", "normal")
      doc.text("123 Business Street", 150, 25, { align: "right" })
      doc.text("City, State 12345", 150, 30, { align: "right" })
      doc.text("contact@yourcompany.com", 150, 35, { align: "right" })

      // Customer details
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("BILL TO", 14, 45)
      doc.setFont("helvetica", "normal")
      doc.text(`Customer ID: ${sale.customerId}`, 14, 50)
      doc.text("customer@example.com", 14, 55)

      // Invoice details
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("INVOICE DATE", 120, 45)
      doc.setFont("helvetica", "normal")
      doc.text(formatDate(sale.createdAt), 120, 50)

      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("PAYMENT METHOD", 170, 45)
      doc.setFont("helvetica", "normal")
      doc.text(sale.paymentMethod, 170, 50)

      // Items table
      const tableColumn = ["Item", "Quantity", "Unit Price", "Amount"]
      const tableRows = sale.saleItems.map((item) => {
        // Use the product map to get the product name
        const productName = productMap[item.productId] || "Unknown Product"

        console.log(`Product ID: ${item.productId}, Name: ${productName}`) // Debug log

        return [
          productName,
          item.quantity.toString(),
          `$${item.price.toFixed(2)}`,
          `$${(item.quantity * item.price).toFixed(2)}`,
        ]
      })

      // Use autoTable correctly
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [66, 66, 66] },
      })

      // Get the y position after the table
      const finalY = (doc as any).lastAutoTable.finalY + 10

      // Summary
      doc.text("Subtotal:", 130, finalY)
      doc.text(`$${sale.totalAmount.toFixed(2)}`, 170, finalY, { align: "right" })

      doc.text(`Discount (${sale.discountPercentage}%):`, 130, finalY + 5)
      doc.text(`-$${(sale.totalAmount * (sale.discountPercentage / 100)).toFixed(2)}`, 170, finalY + 5, {
        align: "right",
      })

      doc.line(130, finalY + 7, 170, finalY + 7)

      doc.setFont("helvetica", "bold")
      doc.text("Total:", 130, finalY + 12)
      doc.text(`$${sale.finalAmount.toFixed(2)}`, 170, finalY + 12, { align: "right" })

      // Status
      doc.setFillColor(39, 174, 96)
      doc.rect(130, finalY + 15, 40, 7, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.text("PAID", 150, finalY + 20, { align: "center" })

      // Reset text color
      doc.setTextColor(0, 0, 0)

      // Notes
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("Notes", 14, finalY + 30)
      doc.setFont("helvetica", "normal")
      doc.text(
        "Thank you for your business. Please contact us if you have any questions about this invoice.",
        14,
        finalY + 35,
      )

      // Save the PDF
      doc.save(`invoice-${sale.saleId.substring(0, 8)}.pdf`)

      toast({
        title: "PDF Generated",
        description: "Your invoice has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Generating PDF...</div>
  }

  if (!sale) {
    return <div className="text-center p-8">Invoice not found</div>
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">PDF Generated</h2>
        <p className="mb-4">Your invoice has been downloaded.</p>
        <p className="text-sm text-muted-foreground">You can close this window now.</p>
      </div>
    </div>
  )
}


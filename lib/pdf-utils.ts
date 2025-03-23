import { jsPDF } from "jspdf"
import "jspdf-autotable"

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

export const generateInvoicePDF = (sale: Sale, products: Product[], getProductName: (id: string) => string) => {
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
  doc.text(new Date(sale.createdAt).toLocaleDateString(), 120, 50)

  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("PAYMENT METHOD", 170, 45)
  doc.setFont("helvetica", "normal")
  doc.text(sale.paymentMethod, 170, 50)

  // Items table
  const tableColumn = ["Item", "Quantity", "Unit Price", "Amount"]
  const tableRows = sale.saleItems.map((item) => [
    getProductName(item.productId),
    item.quantity.toString(),
    `$${item.price.toFixed(2)}`,
    `$${(item.quantity * item.price).toFixed(2)}`,
  ])

  // @ts-ignore - jspdf-autotable types are not properly recognized
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 65,
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 66, 66] },
  })

  // @ts-ignore - get the y position after the table
  const finalY = (doc as any).lastAutoTable.finalY + 10

  // Summary
  doc.text("Subtotal:", 130, finalY)
  doc.text(`$${sale.totalAmount.toFixed(2)}`, 170, finalY, { align: "right" })

  doc.text(`Discount (${sale.discountPercentage}%):`, 130, finalY + 5)
  doc.text(`-$${(sale.totalAmount * (sale.discountPercentage / 100)).toFixed(2)}`, 170, finalY + 5, { align: "right" })

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

  return doc
}


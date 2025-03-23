"use client"

import { useState, useEffect } from "react"

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

export function InvoicePrint({ id }: { id: string }) {
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
        }

        setProducts(productsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  useEffect(() => {
    // Automatically open print dialog when the component mounts
    if (sale && !loading) {
      setTimeout(() => {
        window.print()
      }, 1000)
    }
  }, [sale, loading])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    return product ? product.name : "Unknown Product"
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading invoice data...</div>
  }

  if (!sale) {
    return <div className="text-center p-8">Invoice not found</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between">
          <div>
            <h3 className="text-2xl font-bold">INVOICE</h3>
            <p className="text-gray-500">INV-{id.substring(0, 8)}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">Your Company Name</p>
            <p className="text-sm text-gray-500">123 Business Street</p>
            <p className="text-sm text-gray-500">City, State 12345</p>
            <p className="text-sm text-gray-500">contact@yourcompany.com</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-semibold uppercase text-gray-500">Bill To</p>
            <p className="font-semibold">Customer ID: {sale.customerId}</p>
            <p className="text-sm text-gray-500">customer@example.com</p>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold uppercase text-gray-500">Invoice Date</p>
                <p>{formatDate(sale.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase text-gray-500">Payment Method</p>
                <p>{sale.paymentMethod}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="border border-gray-200 rounded-md">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="p-2 text-left font-semibold">Item</th>
                  <th className="p-2 text-left font-semibold">Quantity</th>
                  <th className="p-2 text-left font-semibold">Unit Price</th>
                  <th className="p-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {sale.saleItems.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
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
            <hr className="my-2" />
            <div className="flex justify-between font-bold">
              <p>Total</p>
              <p>${sale.finalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-2 text-center text-sm font-medium text-green-900 rounded-md">Paid</div>
          </div>
        </div>

        <div>
          <p className="font-semibold">Notes</p>
          <p className="text-sm text-gray-500">
            Thank you for your business. Please contact us if you have any questions about this invoice.
          </p>
        </div>
      </div>
    </div>
  )
}


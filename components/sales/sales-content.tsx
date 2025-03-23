"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Search, Trash2, FileText } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

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

export function SalesContent() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [newSaleId, setNewSaleId] = useState<string | null>(null)
  const dialogCloseRef = useRef<HTMLButtonElement>(null)

  // New sale form state
  const [customerId, setCustomerId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Credit Card")
  const [discountPercentage, setDiscountPercentage] = useState("0")
  const [saleItems, setSaleItems] = useState<{ productId: string; quantity: number; price: number }[]>([
    { productId: "", quantity: 1, price: 0 },
  ])

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

  const resetForm = () => {
    setCustomerId("")
    setPaymentMethod("Credit Card")
    setDiscountPercentage("0")
    setSaleItems([{ productId: "", quantity: 1, price: 0 }])
    setNewSaleId(null)
  }

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId)
    const newItems = [...saleItems]

    newItems[index] = {
      ...newItems[index],
      productId,
      price: product ? product.price : 0,
    }

    setSaleItems(newItems)
  }

  const handleQuantityChange = (index: number, quantity: string) => {
    const newItems = [...saleItems]
    newItems[index] = {
      ...newItems[index],
      quantity: Number.parseInt(quantity) || 1,
    }
    setSaleItems(newItems)
  }

  const addSaleItem = () => {
    setSaleItems([...saleItems, { productId: "", quantity: 1, price: 0 }])
  }

  const removeSaleItem = (index: number) => {
    if (saleItems.length > 1) {
      const newItems = [...saleItems]
      newItems.splice(index, 1)
      setSaleItems(newItems)
    }
  }

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
  }

  const calculateFinalAmount = () => {
    const total = calculateTotal()
    const discount = Number.parseFloat(discountPercentage) || 0
    return total - total * (discount / 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!customerId) {
      toast({
        title: "Error",
        description: "Please enter a customer ID",
        variant: "destructive",
      })
      return
    }

    if (saleItems.some((item) => !item.productId)) {
      toast({
        title: "Error",
        description: "Please select a product for each item",
        variant: "destructive",
      })
      return
    }

    try {
      const saleData = {
        customerId,
        saleItems,
        paymentMethod,
        discountPercentage: Number.parseFloat(discountPercentage) || 0,
      }

      const response = await fetch("http://localhost:8080/api/v1/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      })

      if (response.ok) {
        const newSale = await response.json()
        setSales([...sales, newSale])
        setNewSaleId(newSale.saleId)

        toast({
          title: "Sale created",
          description: (
            <div>
              The sale has been successfully recorded.
              <div className="mt-2">
                <Link href={`/invoices/${newSale.saleId}`} className="text-primary hover:underline">
                  View Invoice
                </Link>
              </div>
            </div>
          ),
        })

        // Close the dialog
        if (dialogCloseRef.current) {
          dialogCloseRef.current.click()
        }

        resetForm()
      } else {
        throw new Error("Failed to create sale")
      }
    } catch (error) {
      console.error("Error creating sale:", error)
      toast({
        title: "Error",
        description: "Failed to create the sale. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    return product ? product.name : "Unknown Product"
  }

  const filteredSales = sales.filter((sale) => sale.customerId.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading sales data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Sales</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Sale</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer ID</Label>
                  <Input id="customerId" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sale Items</Label>
                {saleItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select value={item.productId} onValueChange={(value) => handleProductChange(index, value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ${product.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      className="w-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSaleItem(index)}
                      disabled={saleItems.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addSaleItem}>
                  Add Item
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPercentage">Discount (%)</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>{discountPercentage}%</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${calculateFinalAmount().toFixed(2)}</span>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={resetForm} ref={dialogCloseRef}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Create Sale</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by customer ID..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sale ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No sales found
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale) => (
                <TableRow key={sale.saleId}>
                  <TableCell className="font-medium">{sale.saleId.substring(0, 8)}...</TableCell>
                  <TableCell>{sale.customerId}</TableCell>
                  <TableCell>{sale.saleItems.length} items</TableCell>
                  <TableCell>${sale.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{sale.paymentMethod}</TableCell>
                  <TableCell>{formatDate(sale.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/invoices/${sale.saleId}`}>
                      <Button variant="outline" size="icon" title="View Invoice">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredSales.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredSales.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0) / filteredSales.length).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredSales.reduce(
                  (sum, sale) => sum + sale.saleItems.reduce((itemSum, item) => itemSum + item.quantity, 0),
                  0,
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}


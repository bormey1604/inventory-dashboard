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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Plus, MoreHorizontal, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Category {
  id: string
  name: string
  products: Product[]
}

interface Product {
  id: string
  name: string
  price: number
  description: string
  stock: number
  categoryId: string
}

export function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const dialogCloseRef = useRef<HTMLButtonElement>(null)
  const editDialogCloseRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setCategoryName(category.name)
  }

  const resetForm = () => {
    setCategoryName("")
    setEditingCategory(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const categoryData = {
        name: categoryName,
      }

      let response

      if (editingCategory) {
        // Update existing category
        response = await fetch(`http://localhost:8080/api/v1/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryData),
        })
      } else {
        // Create new category
        response = await fetch("http://localhost:8080/api/v1/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryData),
        })
      }

      if (response.ok) {
        fetchCategories()
        resetForm()

        toast({
          title: editingCategory ? "Category updated" : "Category created",
          description: editingCategory
            ? "The category has been successfully updated."
            : "The category has been successfully created.",
        })

        // Close the dialog
        if (editingCategory) {
          if (editDialogCloseRef.current) {
            editDialogCloseRef.current.click()
          }
        } else {
          if (dialogCloseRef.current) {
            dialogCloseRef.current.click()
          }
        }
      } else {
        throw new Error("Failed to save category")
      }
    } catch (error) {
      console.error("Error saving category:", error)
      toast({
        title: "Error",
        description: "Failed to save the category. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    // Check if category has products
    const category = categories.find((c) => c.id === id)
    if (category && category.products.length > 0) {
      toast({
        title: "Cannot delete category",
        description: "This category contains products. Remove or reassign the products first.",
        variant: "destructive",
      })
      return
    }

    if (confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/categories/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setCategories(categories.filter((category) => category.id !== id))
          toast({
            title: "Category deleted",
            description: "The category has been successfully deleted.",
          })
        } else {
          throw new Error("Failed to delete category")
        }
      } catch (error) {
        console.error("Error deleting category:", error)
        toast({
          title: "Error",
          description: "Failed to delete the category. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading categories data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={resetForm} ref={dialogCloseRef}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">{editingCategory ? "Update" : "Create"}</Button>
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
            placeholder="Search categories..."
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
              <TableHead>Name</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.products.length}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                handleEdit(category)
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                              <DialogTitle>Edit Category</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Category Name</Label>
                                <Input
                                  id="edit-name"
                                  value={categoryName}
                                  onChange={(e) => setCategoryName(e.target.value)}
                                  required
                                />
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button type="button" variant="outline" onClick={resetForm} ref={editDialogCloseRef}>
                                    Cancel
                                  </Button>
                                </DialogClose>
                                <Button type="submit">Update</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => handleDelete(category.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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


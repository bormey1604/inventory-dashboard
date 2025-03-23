"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useTheme } from "next-themes"

interface RevenueData {
  revenue: number
  month: string
}

export function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()

  useEffect(() => {
    async function fetchRevenueData() {
      try {
        const response = await fetch("http://localhost:8080/api/v1/stats/revenue/monthly")
        const rawData = await response.json()

        // Format the data for better display
        const formattedData = rawData.map((item: RevenueData) => ({
          ...item,
          month: formatMonth(item.month),
        }))

        // Sort by month
        formattedData.sort((a: RevenueData, b: RevenueData) => {
          return a.month.localeCompare(b.month)
        })

        setData(formattedData)
      } catch (error) {
        console.error("Error fetching revenue data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [])

  function formatMonth(monthStr: string) {
    const [year, month] = monthStr.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleString("default", { month: "short" })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading chart data...</div>
  }

  if (data.length === 0) {
    return <div className="text-center">No revenue data available</div>
  }

  const textColor = theme === "dark" ? "#ffffff" : "#000000"
  const gridColor = theme === "dark" ? "#333333" : "#e5e5e5"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="month" tick={{ fill: textColor }} />
        <YAxis tick={{ fill: textColor }} tickFormatter={(value) => `$${value}`} />
        <Tooltip
          formatter={(value) => [`$${value}`, "Revenue"]}
          contentStyle={{
            backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
            color: textColor,
            border: `1px solid ${gridColor}`,
          }}
        />
        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}


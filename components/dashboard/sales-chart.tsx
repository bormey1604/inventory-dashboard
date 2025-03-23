"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useTheme } from "next-themes"

interface SalesData {
  date: string
  totalSales: number
}

export function SalesChart() {
  const [data, setData] = useState<SalesData[]>([])
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()

  useEffect(() => {
    async function fetchSalesData() {
      try {
        const response = await fetch("http://localhost:8080/api/v1/stats/sales/last7days")
        const rawData = await response.json()

        // Format the data for better display
        const formattedData = rawData.map((item: SalesData) => ({
          ...item,
          date: formatDate(item.date),
        }))

        // Sort by date (oldest to newest)
        formattedData.sort((a: SalesData, b: SalesData) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        })

        setData(formattedData)
      } catch (error) {
        console.error("Error fetching sales data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSalesData()
  }, [])

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading chart data...</div>
  }

  if (data.length === 0) {
    return <div className="text-center">No sales data available</div>
  }

  const textColor = theme === "dark" ? "#ffffff" : "#000000"
  const gridColor = theme === "dark" ? "#333333" : "#e5e5e5"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" tick={{ fill: textColor }} />
        <YAxis tick={{ fill: textColor }} allowDecimals={false} />
        <Tooltip
          formatter={(value) => [value, "Sales"]}
          contentStyle={{
            backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
            color: textColor,
            border: `1px solid ${gridColor}`,
          }}
        />
        <Line
          type="monotone"
          dataKey="totalSales"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}


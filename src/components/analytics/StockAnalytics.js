"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const StockAnalytics = ({ reports, onExportChart }) => {
  const [activeChart, setActiveChart] = useState("overview")

  // Department colors
  const DEPARTMENT_COLORS = {
    Moulding: "#3498db",
    Melting: "#e74c3c",
    Grinding: "#f39c12",
    Inspection: "#27ae60",
  }

  const departmentStockData =
    reports?.stockByDepartment?.map((dept) => ({
      department: dept.department,
      totalStock: Number.parseInt(dept.total_stock),
      totalProducts: Number.parseInt(dept.total_products),
      lowStockCount: Number.parseInt(dept.low_stock_count),
      availableStock: Number.parseInt(dept.total_products) - Number.parseInt(dept.low_stock_count),
      color: DEPARTMENT_COLORS[dept.department],
    })) || []

  const productThresholdData =
    reports?.recentUpdates?.slice(0, 8).map((item) => {
      const totalQuantity = Number.parseInt(item.quantity)
      const thresholdLevel = 5 // Set threshold to 5 as per requirement

      return {
        name: item.item_name.length > 12 ? item.item_name.substring(0, 12) + "..." : item.item_name,
        fullName: item.item_name,
        threshold: Math.min(totalQuantity, thresholdLevel), // Red bar at bottom (threshold amount)
        available: Math.max(0, totalQuantity - thresholdLevel), // Green bar on top (remaining after threshold)
        department: item.department,
        totalQuantity: totalQuantity,
      }
    }) || []

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    switch (activeChart) {
      case "overview":
        return (
          <div className="chart-grid" id="overview-charts">
            <div className="chart-container">
              <h4>📊 Stock Distribution by Department</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentStockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="totalStock" fill="#3498db" name="Total Stock" />
                  <Bar dataKey="totalProducts" fill="#2ecc71" name="Total Products" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h4>⚠️ Product Threshold Status</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productThresholdData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={10} />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="chart-tooltip">
                            <p className="tooltip-label">{data.fullName}</p>
                            <p className="tooltip-value">Total Stock: {data.totalQuantity}</p>
                            <p className="tooltip-value" style={{ color: "#e74c3c" }}>
                              Threshold (Bottom): {data.threshold}
                            </p>
                            <p className="tooltip-value" style={{ color: "#27ae60" }}>
                              Available Above Threshold: {data.available}
                            </p>
                            <p className="tooltip-value">Department: {data.department}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar dataKey="threshold" stackId="a" fill="#e74c3c" name="Threshold (Bottom)" />
                  <Bar dataKey="available" stackId="a" fill="#27ae60" name="Available (Top)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      case "departments":
        return (
          <div className="chart-grid" id="department-charts">
            <div className="chart-container full-width">
              <h4>🏭 Department Stock Analysis</h4>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={departmentStockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="availableStock" fill="#27ae60" name="Available Stock" />
                  <Bar dataKey="lowStockCount" fill="#e74c3c" name="Low Stock Items" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      case "alerts":
        const alertsData = departmentStockData.map((dept) => ({
          department: dept.department,
          normalStock: dept.availableStock,
          lowStock: dept.lowStockCount,
          alertPercentage: dept.totalProducts > 0 ? ((dept.lowStockCount / dept.totalProducts) * 100).toFixed(1) : 0,
        }))

        return (
          <div className="chart-grid" id="alerts-charts">
            <div className="chart-container full-width">
              <h4>🚨 Stock Alert Status</h4>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={alertsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="normalStock" stackId="a" fill="#27ae60" name="Normal Stock" />
                  <Bar dataKey="lowStock" stackId="a" fill="#e74c3c" name="Low Stock" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h3>📊 Stock Analytics Dashboard</h3>
        <div className="chart-controls">
          <div className="chart-tabs">
            <button
              className={`chart-tab ${activeChart === "overview" ? "active" : ""}`}
              onClick={() => setActiveChart("overview")}
            >
              📊 Overview
            </button>
            <button
              className={`chart-tab ${activeChart === "departments" ? "active" : ""}`}
              onClick={() => setActiveChart("departments")}
            >
              🏭 Departments
            </button>
            <button
              className={`chart-tab ${activeChart === "alerts" ? "active" : ""}`}
              onClick={() => setActiveChart("alerts")}
            >
              🚨 Alerts
            </button>
          </div>
          <button className="export-chart-btn" onClick={() => onExportChart(activeChart)}>
            📊 Export Chart
          </button>
        </div>
      </div>

      <div className="analytics-content">{renderChart()}</div>

      <div className="insights-section">
        <h4>🔍 Key Insights</h4>
        <div className="insights-grid">
          <div className="insight-card">
            <h5>📈 Highest Stock</h5>
            <p>
              {departmentStockData.length > 0 &&
                departmentStockData.reduce((max, dept) => (dept.totalStock > max.totalStock ? dept : max))?.department}
            </p>
          </div>
          <div className="insight-card alert">
            <h5>⚠️ Most Alerts</h5>
            <p>
              {departmentStockData.length > 0 &&
                departmentStockData.reduce((max, dept) => (dept.lowStockCount > max.lowStockCount ? dept : max))
                  ?.department}
            </p>
          </div>
          <div className="insight-card">
            <h5>📊 Stock Health</h5>
            <p>
              {departmentStockData.length > 0 &&
                Math.round(
                  (departmentStockData.reduce((sum, dept) => sum + dept.availableStock, 0) /
                    departmentStockData.reduce((sum, dept) => sum + dept.totalProducts, 0)) *
                    100,
                )}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StockAnalytics

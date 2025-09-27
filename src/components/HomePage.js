"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import "../styles/HomePage.css"
import { BACKEND_URL } from "../constants"

const HomePage = () => {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [lowStockItems, setLowStockItems] = useState([])

  useEffect(() => {
    fetchStock()
  }, [])

  const fetchStock = async () => {
    try {
      const response = await axios.get("`${BACKEND_URL}/stock/alerts")
      if (response.data.success) {
        setStock(response.data.data)
        setLowStockCount(response.data.lowStockCount)
        setLowStockItems(response.data.lowStockItems || [])
      }
    } catch (error) {
      console.error("Failed to fetch stock data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getDepartmentColor = (department) => {
    const colors = {
      Moulding: "#3498db",
      Melting: "#e74c3c",
      Grinding: "#f39c12",
      Inspection: "#27ae60",
    }
    return colors[department] || "#95a5a6"
  }

  const renderLowStockAlert = () => {
    if (lowStockCount === 0) return null

    if (lowStockCount === 1) {
      return (
        <div className="alert-banner">
          ⚠️ Alert: <strong>{lowStockItems[0]}</strong> is running low on stock!
        </div>
      )
    } else if (lowStockCount === 2) {
      return (
        <div className="alert-banner">
          ⚠️ Alert: <strong>{lowStockItems[0]}</strong> and <strong>{lowStockItems[1]}</strong> are running low on stock!
        </div>
      )
    } else {
      return (
        <div className="alert-banner">
          ⚠️ Alert: <strong>{lowStockItems.slice(0, 2).join(", ")}</strong> and {lowStockCount - 2} other items are
          running low on stock!
        </div>
      )
    }
  }

  if (loading) {
    return <div className="loading">Loading stock data...</div>
  }

  return (
    <div className="homepage">
      <nav className="homepage-navbar">
        <div className="navbar-brand">
          <h1>🏭 Shakthi Stockpoint</h1>
        </div>
        <div className="navbar-menu">
          <div className="login-dropdown">
            <button className="login-btn">Login As ▼</button>
            <div className="dropdown-content">
              <Link to="/login?role=admin">Admin</Link>
              <Link to="/login?role=supervisor">Supervisor</Link>
              <Link to="/login?role=operator">Operator</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="homepage-content">
        <div className="welcome-section">
          <h2>Welcome to Shakthi Stockpoint</h2>
          {renderLowStockAlert()}
        </div>

        <div className="stock-overview">
          <h3>📊 Current Stock Overview</h3>
          <div className="stock-grid">
            {stock.map((item) => (
              <div key={item.id} className={`stock-card ${item.alert_status === "LOW_STOCK" ? "low-stock" : ""}`}>
                <div className="stock-header">
                  <h4>{item.item_name}</h4>
                  <div className="header-badges">
                    {item.department && (
                      <span
                        className="department-badge"
                        style={{ backgroundColor: getDepartmentColor(item.department) }}
                      >
                        🏭 {item.department}
                      </span>
                    )}
                    {item.alert_status === "LOW_STOCK" && <span className="alert-badge">⚠️ Low Stock</span>}
                  </div>
                </div>
                <div className="stock-details">
                  <div className="quantity-info">
                    <span className="quantity">{item.quantity}</span>
                    <span className="unit">units</span>
                  </div>
                  <div className="threshold-info">
                    <small>Threshold: {item.threshold_value}</small>
                  </div>
                  <div className="update-info">
                    <small>Updated: {formatDate(item.last_updated)}</small>
                    <small>By: {item.updated_by}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="quick-stats">
          <div className="stat-card">
            <h3>Total Items</h3>
            <p>{stock.length}</p>
          </div>
          <div className="stat-card alert">
            <h3>Low Stock Items</h3>
            <p>{lowStockCount}</p>
          </div>
          <div className="stat-card">
            <h3>Total Stock</h3>
            <p>{stock.reduce((sum, item) => sum + item.quantity, 0)}</p>
          </div>
          <div className="stat-card">
            <h3>Departments</h3>
            <p>4</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage

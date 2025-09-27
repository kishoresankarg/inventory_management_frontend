"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "../styles/OperatorDashboard.css"

const OperatorDashboard = ({ operator }) => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [lowStockItems, setLowStockItems] = useState([])
  const [lowStockCount, setLowStockCount] = useState(0)

  // Stock update states
  const [editingStock, setEditingStock] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    fetchStock()

    // Listen for navbar tab changes
    const handleTabChange = (event) => {
      setActiveTab(event.detail)
    }

    window.addEventListener("operatorTabChange", handleTabChange)

    return () => {
      window.removeEventListener("operatorTabChange", handleTabChange)
    }
  }, [])

  // Add this useEffect to communicate active tab back to navbar
  useEffect(() => {
    // Notify navbar about active tab changes
    window.dispatchEvent(new CustomEvent("operatorActiveTabChange", { detail: activeTab }))
  }, [activeTab])

  const fetchStock = async () => {
    try {
      console.log("=== OPERATOR DASHBOARD FETCH STOCK ===")
      console.log("Operator details:")
      console.log("  Username:", operator.username)
      console.log("  Role:", operator.role)
      console.log("  Department:", operator.department)

      // Validate operator data
      if (!operator.department || operator.department === "undefined" || operator.department === "null") {
        console.error("❌ Operator has no department assigned!")
        alert("Error: Your account has no department assigned. Please contact your administrator.")
        setLoading(false)
        return
      }

      const headers = {
        "user-role": operator.role,
        "user-department": operator.department,
        "Content-Type": "application/json",
      }

      console.log("📤 Sending headers:", headers)

      const response = await axios.get("http://localhost:5000/stock/alerts", {
        headers: headers,
        timeout: 10000, // 10 second timeout
      })

      console.log("📥 Response received:", response.data)

      if (response.data.success) {
        const stockData = response.data.data || []
        setStock(stockData)
        setLowStockItems(response.data.lowStockItems || [])
        setLowStockCount(response.data.lowStockCount || 0)

        console.log("✅ Stock items loaded:", stockData.length, "items")
        if (stockData.length > 0) {
          console.log("📦 Items in operator dashboard:")
          stockData.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.item_name} (${item.department})`)
          })
        } else {
          console.log("⚠️ No items found for department:", operator.department)
        }
      } else {
        console.error("❌ Server returned error:", response.data.message)
        setStock([])
        alert("Error loading stock data: " + response.data.message)
      }
      console.log("=== END OPERATOR DASHBOARD FETCH STOCK ===")
    } catch (error) {
      console.error("❌ Failed to fetch stock data:", error)
      setStock([]) // Set empty array instead of leaving undefined

      if (error.response) {
        console.error("❌ Server response:", error.response.data)
        const errorMessage = error.response.data.message || "Failed to load stock data"
        alert("Error: " + errorMessage)
      } else if (error.request) {
        console.error("❌ Network error:", error.request)
        alert("Network error: Please check your connection and server status")
      } else {
        console.error("❌ Request error:", error.message)
        alert("Request error: " + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // Stock Update Functions
  const handleUpdateStock = async (stockId, updatedData) => {
    try {
      await axios.put(`http://localhost:5000/stock/${stockId}`, {
        ...updatedData,
        updated_by: operator.username,
        user_role: operator.role,
        user_department: operator.department,
      })

      setEditingStock(null)
      fetchStock()
      alert("Stock updated successfully!")
    } catch (error) {
      console.error("Failed to update stock:", error)
      alert("Failed to update stock: " + (error.response?.data?.message || "Server error"))
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
          ⚠️ Alert: <strong>{lowStockItems[0]}</strong> in {operator.department} department is running low on stock!
        </div>
      )
    } else if (lowStockCount === 2) {
      return (
        <div className="alert-banner">
          ⚠️ Alert: <strong>{lowStockItems[0]}</strong> and <strong>{lowStockItems[1]}</strong> in {operator.department}{" "}
          department are running low on stock!
        </div>
      )
    } else {
      return (
        <div className="alert-banner">
          ⚠️ Alert: <strong>{lowStockItems.slice(0, 2).join(", ")}</strong> and {lowStockCount - 2} other items in{" "}
          {operator.department} department are running low on stock!
        </div>
      )
    }
  }

  // Dashboard Tab Component (similar to HomePage but department-specific)
  const renderDashboardTab = () => (
    <div className="dashboard-overview">
      <div className="welcome-section">
        <h2>🏭 {operator.department} Department - Welcome Operator</h2>
        <p className="operator-subtitle">Managing {operator.department} Department Stock</p>
        {renderLowStockAlert()}
      </div>

      <div className="stock-overview">
        <h3>📊 {operator.department} Department Stock Overview</h3>
        <div className="stock-grid">
          {stock.map((item) => (
            <div key={item.id} className={`stock-card ${item.alert_status === "LOW_STOCK" ? "low-stock" : ""}`}>
              <div className="stock-header">
                <h4>{item.item_name}</h4>
                <div className="header-badges">
                  <span className="department-badge" style={{ backgroundColor: getDepartmentColor(item.department) }}>
                    🏭 {item.department}
                  </span>
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
          <h3>Department Products</h3>
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
          <h3>Department</h3>
          <p>{operator.department}</p>
        </div>
      </div>
    </div>
  )

  const renderUpdateStockTab = () => (
    <div className="manage-section">
      <div className="section-header">
        <h3>📦 Update {operator.department} Department Stock</h3>
        <div className="info-badge">
          <span>📝 Update stock quantities only - Contact supervisor to add/delete products</span>
        </div>
      </div>

      {stock.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "#7f8c8d",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            margin: "1rem 0",
          }}
        >
          <h4>No stock items found</h4>
          <p>There are no stock items assigned to the {operator.department} department.</p>
          <p>Contact your supervisor to add products to this department.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Current Quantity</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Updated By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((item) => (
                <tr key={item.id} className={item.alert_status === "LOW_STOCK" ? "low-stock-row" : ""}>
                  <td>
                    <strong>{item.item_name}</strong>
                    {item.alert_status === "LOW_STOCK" && <span className="alert-icon">⚠️</span>}
                  </td>
                  <td>
                    {editingStock === item.id ? (
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          setStock(stock.map((s) => (s.id === item.id ? { ...s, quantity: e.target.value } : s)))
                        }
                        className="edit-input"
                        min="0"
                      />
                    ) : (
                      <span className={item.alert_status === "LOW_STOCK" ? "low-stock-text" : ""}>{item.quantity}</span>
                    )}
                  </td>
                  <td>
                    <span className="threshold-display">{item.threshold_value}</span>
                    <small className="threshold-note">(Contact supervisor to change)</small>
                  </td>
                  <td>
                    <span className={`status-badge ${item.alert_status === "LOW_STOCK" ? "low" : "normal"}`}>
                      {item.alert_status === "LOW_STOCK" ? "Low Stock" : "Normal"}
                    </span>
                  </td>
                  <td>{formatDate(item.last_updated)}</td>
                  <td>{item.updated_by}</td>
                  <td>
                    {editingStock === item.id ? (
                      <div className="action-buttons">
                        <button
                          className="save-btn"
                          onClick={() =>
                            handleUpdateStock(item.id, {
                              quantity: Number.parseInt(item.quantity),
                            })
                          }
                        >
                          Save
                        </button>
                        <button className="cancel-btn" onClick={() => setEditingStock(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button className="edit-btn" onClick={() => setEditingStock(item.id)}>
                          Update
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="operator-notes">
        <h4>📋 Operator Guidelines</h4>
        <ul>
          <li>✅ You can update stock quantities for items in your department</li>
          <li>❌ You cannot change threshold values - contact your supervisor</li>
          <li>❌ You cannot add or delete products - contact your supervisor</li>
          <li>⚠️ Always ensure accurate counts when updating stock</li>
          <li>📞 Report any discrepancies to your supervisor immediately</li>
        </ul>
      </div>
    </div>
  )

  if (loading) {
    return <div className="loading">Loading operator dashboard...</div>
  }

  return (
    <div className="operator-dashboard">
      <div className="dashboard-container">
        <div className="tab-content">
          {activeTab === "dashboard" && renderDashboardTab()}
          {activeTab === "update-stock" && renderUpdateStockTab()}
        </div>
      </div>
    </div>
  )
}

export default OperatorDashboard

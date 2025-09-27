"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "../styles/UpdateStock.css"

const UpdateStock = ({ operator }) => {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingStock, setEditingStock] = useState(null)
  const [lowStockCount, setLowStockCount] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    fetchStock()
  }, [])

  const fetchStock = async () => {
    try {
      console.log("=== UPDATE STOCK PAGE FETCH ===")
      console.log("Operator details:")
      console.log("  Username:", operator?.username)
      console.log("  Role:", operator?.role)
      console.log("  Department:", operator?.department)

      // Validate operator data
      if (!operator) {
        console.error("❌ No operator data provided!")
        setError("No operator data available. Please login again.")
        setLoading(false)
        return
      }

      if (!operator.department || operator.department === "undefined" || operator.department === "null") {
        console.error("❌ Operator has no department assigned!")
        setError("Your account has no department assigned. Please contact your administrator.")
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
        // Debug: Log the stock calculation
        const departmentTotal = stockData.reduce((sum, item) => sum + Number(item.quantity), 0)
        console.log("📊 Department stock calculation:")
        console.log(
          "  Items:",
          stockData.map((item) => `${item.item_name}: ${item.quantity}`),
        )
        console.log("  Department Total:", departmentTotal)
        setLowStockCount(response.data.lowStockCount || 0)
        setError(null)

        console.log("✅ Stock items loaded:", stockData.length, "items")
        if (stockData.length > 0) {
          console.log("📦 Items in update stock page:")
          stockData.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.item_name} (${item.department})`)
          })
        } else {
          console.log("⚠️ No items found for department:", operator.department)
        }
      } else {
        console.error("❌ Server returned error:", response.data.message)
        setError(response.data.message || "Failed to load stock data")
        setStock([])
      }
      console.log("=== END UPDATE STOCK PAGE FETCH ===")
    } catch (error) {
      console.error("❌ Failed to fetch stock data:", error)
      setStock([])

      if (error.response) {
        console.error("❌ Server response:", error.response.data)
        const errorMessage = error.response.data.message || "Failed to load stock data"
        setError(errorMessage)
      } else if (error.request) {
        console.error("❌ Network error:", error.request)
        setError("Network error: Please check your connection and server status")
      } else {
        console.error("❌ Request error:", error.message)
        setError("Request error: " + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="update-stock">
        <div className="container">
          <div className="loading">Loading stock data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="update-stock">
      <div className="container">
        <div className="header">
          <h1>📦 Update Stock Quantities</h1>
          <p>Update stock quantities for existing items</p>
          {operator?.department && (
            <div className="department-info">
              <span className="department-badge" style={{ backgroundColor: getDepartmentColor(operator.department) }}>
                🏭 {operator.department} Department
              </span>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {!error && stock.length === 0 ? (
          <div className="no-data-message">
            <h3>No stock items found</h3>
            <p>There are no stock items assigned to the {operator?.department} department.</p>
            <p>Contact your supervisor to add products to this department.</p>
          </div>
        ) : (
          !error && (
            <>
              <div className="table-container">
                <table className="stock-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
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
                            <span className={item.alert_status === "LOW_STOCK" ? "low-stock-text" : ""}>
                              {item.quantity}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="threshold-display">{item.threshold_value}</span>
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

              <div className="stats-section">
                <div className="stat-card">
                  <h3>Department Items</h3>
                  <p>{stock.length}</p>
                </div>
                <div className="stat-card alert">
                  <h3>Low Stock Items</h3>
                  <p>{lowStockCount}</p>
                </div>
                <div className="stat-card">
                  <h3>Department Stock</h3>
                  <p>{stock.reduce((sum, item) => sum + Number(item.quantity), 0)}</p>
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  )
}

export default UpdateStock

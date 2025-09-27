"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "../styles/SupervisorDashboard.css"
import { BACKEND_URL } from "../constants"

const SupervisorDashboard = ({ operator }) => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [stock, setStock] = useState([])
  const [operators, setOperators] = useState([])
  const [loading, setLoading] = useState(true)
  const [lowStockItems, setLowStockItems] = useState([])
  const [lowStockCount, setLowStockCount] = useState(0)

  // Product management states
  const [editingProduct, setEditingProduct] = useState(null)
  const [newProduct, setNewProduct] = useState({
    item_name: "",
    quantity: "",
    threshold_value: 10,
    department: operator?.department || "Moulding",
  })
  const [showAddProduct, setShowAddProduct] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    fetchStock()
    fetchOperators()

    // Listen for navbar tab changes
    const handleTabChange = (event) => {
      setActiveTab(event.detail)
    }

    window.addEventListener("supervisorTabChange", handleTabChange)

    return () => {
      window.removeEventListener("supervisorTabChange", handleTabChange)
    }
  }, [])

  // Add this useEffect to communicate active tab back to navbar
  useEffect(() => {
    // Notify navbar about active tab changes
    window.dispatchEvent(new CustomEvent("supervisorActiveTabChange", { detail: activeTab }))
  }, [activeTab])

  const fetchStock = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/stock/alerts`, {
        headers: {
          "user-role": operator.role,
          "user-department": operator.department,
        },
      })
      if (response.data.success) {
        setStock(response.data.data)
        setLowStockItems(response.data.lowStockItems || [])
        setLowStockCount(response.data.lowStockCount || 0)
      }
    } catch (error) {
      console.error("Failed to fetch stock data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOperators = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/operators`, {
        headers: {
          "user-role": operator.role,
          "user-department": operator.department,
        },
      })
      if (response.data.success) {
        setOperators(response.data.data)
      }
    } catch (error) {
      console.error("Failed to fetch operators:", error)
    }
  }

  // Product Management Functions
  const handleAddProduct = async () => {
    if (!newProduct.item_name || !newProduct.quantity) {
      alert("Please fill in all required fields")
      return
    }

    try {
      await axios.post(`${BACKEND_URL}/stock`, {
        ...newProduct,
        quantity: Number.parseInt(newProduct.quantity),
        threshold_value: Number.parseInt(newProduct.threshold_value),
        department: operator.department, // Force supervisor's department
        updated_by: operator.username,
        user_role: operator.role,
        user_department: operator.department,
      })

      setNewProduct({
        item_name: "",
        quantity: "",
        threshold_value: 10,
        department: operator.department,
      })
      setShowAddProduct(false)
      fetchStock()
      alert("Product added successfully!")
    } catch (error) {
      console.error("Failed to add product:", error)
      alert("Failed to add product: " + (error.response?.data?.message || "Server error"))
    }
  }

  const handleUpdateProduct = async (productId, updatedData) => {
    try {
      await axios.put(`${BACKEND_URL}/stock/${productId}`, {
        ...updatedData,
        updated_by: operator.username,
        user_role: operator.role,
        user_department: operator.department,
      })

      setEditingProduct(null)
      fetchStock()
      alert("Product updated successfully!")
    } catch (error) {
      console.error("Failed to update product:", error)
      alert("Failed to update product: " + (error.response?.data?.message || "Server error"))
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${BACKEND_URL}/stock/${productId}`, {
          data: {
            user_role: operator.role,
            user_department: operator.department,
          },
        })

        fetchStock()
        alert("Product deleted successfully!")
      } catch (error) {
        console.error("Failed to delete product:", error)
        alert("Failed to delete product: " + (error.response?.data?.message || "Server error"))
      }
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
        <h2>🏭 {operator.department} Department - Welcome Supervisor</h2>
        <p className="supervisor-subtitle">Managing {operator.department} Department Operations</p>
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
          <h3>Department Operators</h3>
          <p>{operators.length}</p>
        </div>
      </div>
    </div>
  )

  const renderManageProductsTab = () => (
    <div className="manage-section">
      <div className="section-header">
        <h3>📦 Manage {operator.department} Department Stock</h3>
        <button className="add-btn" onClick={() => setShowAddProduct(true)}>
          + Add Product
        </button>
      </div>

      {showAddProduct && (
        <div className="add-form">
          <h4>Add New Product to {operator.department} Department</h4>
          <div className="form-row">
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.item_name}
              onChange={(e) => setNewProduct({ ...newProduct, item_name: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Threshold"
              value={newProduct.threshold_value}
              onChange={(e) => setNewProduct({ ...newProduct, threshold_value: e.target.value })}
            />
            <span className="department-info">
              Department: <strong>{operator.department}</strong>
            </span>
            <button className="save-btn" onClick={handleAddProduct}>
              Save
            </button>
            <button className="cancel-btn" onClick={() => setShowAddProduct(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
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
                  {editingProduct === item.id ? (
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        setStock(stock.map((s) => (s.id === item.id ? { ...s, quantity: e.target.value } : s)))
                      }
                      className="edit-input"
                    />
                  ) : (
                    <span className={item.alert_status === "LOW_STOCK" ? "low-stock-text" : ""}>{item.quantity}</span>
                  )}
                </td>
                <td>
                  {editingProduct === item.id ? (
                    <input
                      type="number"
                      value={item.threshold_value}
                      onChange={(e) =>
                        setStock(stock.map((s) => (s.id === item.id ? { ...s, threshold_value: e.target.value } : s)))
                      }
                      className="edit-input"
                    />
                  ) : (
                    item.threshold_value
                  )}
                </td>
                <td>
                  <span className={`status-badge ${item.alert_status === "LOW_STOCK" ? "low" : "normal"}`}>
                    {item.alert_status === "LOW_STOCK" ? "Low Stock" : "Normal"}
                  </span>
                </td>
                <td>{formatDate(item.last_updated)}</td>
                <td>{item.updated_by}</td>
                <td>
                  {editingProduct === item.id ? (
                    <div className="action-buttons">
                      <button
                        className="save-btn"
                        onClick={() =>
                          handleUpdateProduct(item.id, {
                            quantity: Number.parseInt(item.quantity),
                            threshold_value: Number.parseInt(item.threshold_value),
                          })
                        }
                      >
                        Save
                      </button>
                      <button className="cancel-btn" onClick={() => setEditingProduct(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => setEditingProduct(item.id)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDeleteProduct(item.id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // View-only operators tab (no add/delete functionality)
  const renderViewOperatorsTab = () => (
    <div className="manage-section">
      <div className="section-header">
        <h3>👷‍♂️ Manage {operator.department} Department Operators</h3>
        <div className="info-badge">
          <span>👁️ View Only - Contact Admin to manage operators</span>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Department</th>
              <th>Created Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {operators.length > 0 ? (
              operators.map((op) => (
                <tr key={op.id}>
                  <td>
                    <strong>{op.username}</strong>
                  </td>
                  <td>
                    <span className={`role-badge ${op.role}`}>{op.role}</span>
                  </td>
                  <td>
                    <span className="department-badge" style={{ backgroundColor: getDepartmentColor(op.department) }}>
                      🏭 {op.department}
                    </span>
                  </td>
                  <td>{formatDate(op.created_at)}</td>
                  <td>
                    <span className="status-badge normal">Active</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "#7f8c8d", fontStyle: "italic" }}>
                  No operators found in {operator.department} department
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  if (loading) {
    return <div className="loading">Loading supervisor dashboard...</div>
  }

  return (
    <div className="supervisor-dashboard">
      <div className="dashboard-container">
        <div className="tab-content">
          {activeTab === "dashboard" && renderDashboardTab()}
          {activeTab === "manage-stock" && renderManageProductsTab()}
          {activeTab === "manage-operators" && renderViewOperatorsTab()}
        </div>
      </div>
    </div>
  )
}

export default SupervisorDashboard

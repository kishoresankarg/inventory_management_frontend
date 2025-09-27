"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import StockAnalytics from "./analytics/StockAnalytics"
import ReportExporter from "./analytics/ReportExporter"
import "../styles/AdminDashboard.css"
import "../styles/Analytics.css"
import FloatingChatbot from "./FloatingChatbot"
import { BACKEND_URL } from "../constants"

const AdminDashboard = ({ operator }) => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [stock, setStock] = useState([])
  const [operators, setOperators] = useState([])
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lowStockItems, setLowStockItems] = useState([])
  const [lowStockCount, setLowStockCount] = useState(0)
  const [stockRequests, setStockRequests] = useState([])
  const [vendors, setVendors] = useState([])
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)

  const DEPARTMENTS = ["Moulding", "Melting", "Grinding", "Inspection"]

  const [editingProduct, setEditingProduct] = useState(null)
  const [newProduct, setNewProduct] = useState({
    item_name: "",
    quantity: "",
    threshold_value: 10,
    department: "Moulding",
  })
  const [showAddProduct, setShowAddProduct] = useState(false)

  const [editingOperator, setEditingOperator] = useState(null)
  const [newOperator, setNewOperator] = useState({
    username: "",
    password: "",
    phone: "",
    role: "operator",
    department: "Moulding",
  })
  const [showAddOperator, setShowAddOperator] = useState(false)
  const [editOperatorData, setEditOperatorData] = useState({})

  const [showAddVendor, setShowAddVendor] = useState(false)
  const [newVendor, setNewVendor] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    contact_person: "",
  })

  const navigate = useNavigate()

  useEffect(() => {
    fetchStock()
    fetchOperators()
    fetchReports()
    fetchStockRequests()
    fetchVendors()

    const handleTabChange = (event) => {
      setActiveTab(event.detail)
    }

    window.addEventListener("adminTabChange", handleTabChange)

    return () => {
      window.removeEventListener("adminTabChange", handleTabChange)
    }
  }, [])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("adminActiveTabChange", { detail: activeTab }))
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

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/reports`, {
        headers: {
          "user-role": operator.role,
          "user-department": operator.department,
        },
      })
      if (response.data.success) {
        setReports(response.data.data)
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    }
  }

  const fetchStockRequests = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/low-stock-requests`, {
        headers: {
          "user-role": operator.role,
          "user-department": operator.department,
        },
      })
      if (response.data.success) {
        setStockRequests(response.data.data)
        const pendingCount = response.data.data.filter((req) => req.status === "PENDING").length
        setPendingRequestsCount(pendingCount)
      }
    } catch (error) {
      console.error("Failed to fetch stock requests:", error)
    }
  }

  const fetchVendors = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/vendors`)
      if (response.data.success) {
        setVendors(response.data.data)
      }
    } catch (error) {
      console.error("Failed to fetch vendors:", error)
    }
  }

  const handleAddProduct = async () => {
    if (!newProduct.item_name || !newProduct.quantity || !newProduct.department) {
      alert("Please fill in all required fields")
      return
    }

    try {
      await axios.post(`${BACKEND_URL}/stock`, {
        ...newProduct,
        quantity: Number.parseInt(newProduct.quantity),
        threshold_value: Number.parseInt(newProduct.threshold_value),
        updated_by: operator.username,
        user_role: operator.role,
        user_department: operator.department,
      })

      setNewProduct({ item_name: "", quantity: "", threshold_value: 10, department: "Moulding" })
      setShowAddProduct(false)
      fetchStock()
      fetchReports()
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
      fetchReports()
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
          data: { user_role: operator.role },
        })

        fetchStock()
        fetchReports()
        alert("Product deleted successfully!")
      } catch (error) {
        console.error("Failed to delete product:", error)
        alert("Failed to delete product: " + (error.response?.data?.message || "Server error"))
      }
    }
  }

  const handleAddOperator = async () => {
    if (!newOperator.username || !newOperator.password || !newOperator.phone || !newOperator.department) {
      alert("Please fill in all required fields")
      return
    }

    try {
      await axios.post(`${BACKEND_URL}/operators`, {
        ...newOperator,
        user_role: operator.role,
        user_department: operator.department,
      })

      setNewOperator({ username: "", password: "", phone: "", role: "operator", department: "Moulding" })
      setShowAddOperator(false)
      fetchOperators()
      fetchReports()
      alert("Operator added successfully!")
    } catch (error) {
      console.error("Failed to add operator:", error)
      alert("Failed to add operator: " + (error.response?.data?.message || "Server error"))
    }
  }

  const handleUpdateOperator = async (operatorId, updatedData) => {
    try {
      const updatePayload = {
        username: updatedData.username,
        phone: updatedData.phone,
        user_role: operator.role,
        user_department: operator.department,
      }

      if (updatedData.password && updatedData.password.trim() !== "") {
        updatePayload.password = updatedData.password
      }

      if (updatedData.department) {
        updatePayload.department = updatedData.department
      }

      await axios.put(`${BACKEND_URL}/operators/${operatorId}`, updatePayload)

      setEditingOperator(null)
      setEditOperatorData({})
      fetchOperators()
      fetchReports()
      alert("Operator updated successfully!")
    } catch (error) {
      console.error("Failed to update operator:", error)
      alert("Failed to update operator: " + (error.response?.data?.message || "Server error"))
    }
  }

  const handleDeleteOperator = async (operatorId) => {
    if (window.confirm("Are you sure you want to delete this operator?")) {
      try {
        await axios.delete(`${BACKEND_URL}/operators/${operatorId}`, {
          data: {
            user_role: operator.role,
            user_department: operator.department,
          },
        })

        fetchOperators()
        fetchReports()
        alert("Operator deleted successfully!")
      } catch (error) {
        console.error("Failed to delete operator:", error)
        alert("Failed to delete operator: " + (error.response?.data?.message || "Server error"))
      }
    }
  }

  const handleApproveRequest = async (requestId) => {
    try {
      const response = await axios.put(`${BACKEND_URL}/low-stock-requests/${requestId}/approve`, {
        approved_by: operator.id,
        user_role: operator.role,
        user_department: operator.department,
      })

      fetchStockRequests()
      fetchStock()

      const message = response.data.emailSent
        ? "Request approved and vendor notified via email!"
        : "Request approved successfully!"
      alert(message)
    } catch (error) {
      console.error("Failed to approve request:", error)
      alert("Failed to approve request: " + (error.response?.data?.message || "Server error"))
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.put(`${BACKEND_URL}/low-stock-requests/${requestId}/reject`, {
        approved_by: operator.id,
        user_role: operator.role,
        user_department: operator.department,
      })
      fetchStockRequests()
      alert("Request rejected successfully!")
    } catch (error) {
      console.error("Failed to reject request:", error)
      alert("Failed to reject request: " + (error.response?.data?.message || "Server error"))
    }
  }

  const startEditingOperator = (op) => {
    setEditingOperator(op.id)
    setEditOperatorData({
      username: op.username,
      password: "",
      department: op.department,
    })
  }

  const cancelEditingOperator = () => {
    setEditingOperator(null)
    setEditOperatorData({})
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

  const groupStockByDepartment = () => {
    return DEPARTMENTS.reduce((acc, dept) => {
      acc[dept] = stock.filter((item) => item.department === dept)
      return acc
    }, {})
  }

  const groupOperatorsByDepartment = () => {
    return DEPARTMENTS.reduce((acc, dept) => {
      acc[dept] = operators.filter((op) => op.department === dept)
      return acc
    }, {})
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

  const handleExportChart = (chartType) => {
    console.log(`Exporting chart: ${chartType}`)
  }

  const renderDashboardTab = () => {
    const stockByDepartment = groupStockByDepartment()

    return (
      <div className="dashboard-overview">
        <div className="welcome-section">
          <h2>Stockpoint - Welcome Admin</h2>
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
            <p>{DEPARTMENTS.length}</p>
          </div>
        </div>
      </div>
    )
  }

  const renderManageOperatorsTab = () => {
    const operatorsByDepartment = groupOperatorsByDepartment()

    return (
      <div className="manage-section">
        <div className="section-header">
          <h3> Manage Operators by Department</h3>
          <button className="add-btn" onClick={() => setShowAddOperator(true)}>
            + Add Operator/Supervisor
          </button>
        </div>

        {showAddOperator && (
          <div className="add-form">
            <h4>Add New Operator/Supervisor</h4>
            <div className="form-row">
              <input
                type="text"
                placeholder="Username"
                value={newOperator.username}
                onChange={(e) => setNewOperator({ ...newOperator, username: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newOperator.password}
                onChange={(e) => setNewOperator({ ...newOperator, password: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newOperator.phone}
                onChange={(e) => setNewOperator({ ...newOperator, phone: e.target.value })}
                required
              />
              <select
                value={newOperator.role}
                onChange={(e) => setNewOperator({ ...newOperator, role: e.target.value })}
              >
                <option value="operator">Operator</option>
                <option value="supervisor">Supervisor</option>
              </select>
              <select
                value={newOperator.department}
                onChange={(e) => setNewOperator({ ...newOperator, department: e.target.value })}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <button className="save-btn" onClick={handleAddOperator}>
                Save
              </button>
              <button className="cancel-btn" onClick={() => setShowAddOperator(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {DEPARTMENTS.map((dept) => (
          <div key={dept} className="department-operators">
            <h4 style={{ color: getDepartmentColor(dept), marginBottom: "1rem" }}>
               {dept} Department ({operatorsByDepartment[dept].length} users)
            </h4>

            {operatorsByDepartment[dept].length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                   
                      <th>Role</th>
                      <th>Created Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operatorsByDepartment[dept].map((op) => (
                      <tr key={op.id}>
                        <td>
                          {editingOperator === op.id ? (
                            <input
                              type="text"
                              value={editOperatorData.username}
                              onChange={(e) => setEditOperatorData({ ...editOperatorData, username: e.target.value })}
                              className="edit-input"
                            />
                          ) : (
                            <strong>{op.username}</strong>
                          )}
                        </td>
                        <td>
                          <span className={`role-badge ${op.role}`}>{op.role}</span>
                        </td>
                        <td>{formatDate(op.created_at)}</td>
                        <td>
                          <span className="status-badge normal">Active</span>
                        </td>
                        <td>
                          {editingOperator === op.id ? (
                            <div className="action-buttons">
                              <div className="edit-operator-form">
                                <input
                                  type="password"
                                  placeholder="New Password (optional)"
                                  value={editOperatorData.password}
                                  onChange={(e) =>
                                    setEditOperatorData({ ...editOperatorData, password: e.target.value })
                                  }
                                  className="edit-input"
                                />
                                <select
                                  value={editOperatorData.department}
                                  onChange={(e) =>
                                    setEditOperatorData({ ...editOperatorData, department: e.target.value })
                                  }
                                  className="edit-input"
                                >
                                  {DEPARTMENTS.map((d) => (
                                    <option key={d} value={d}>
                                      {d}
                                    </option>
                                  ))}
                                </select>
                                <div className="edit-buttons">
                                  <button
                                    className="save-btn"
                                    onClick={() => handleUpdateOperator(op.id, editOperatorData)}
                                  >
                                    Save
                                  </button>
                                  <button className="cancel-btn" onClick={cancelEditingOperator}>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button className="edit-btn" onClick={() => startEditingOperator(op)}>
                                Edit
                              </button>
                              <button className="delete-btn" onClick={() => handleDeleteOperator(op.id)}>
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
            ) : (
              <p style={{ color: "#7f8c8d", fontStyle: "italic", marginBottom: "2rem" }}>
                No operators in this department
              </p>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderManageProductsTab = () => {
    const stockByDepartment = groupStockByDepartment()

    return (
      <div className="manage-section">
        <div className="section-header">
          <h3>Manage Products by Department</h3>
          <button className="add-btn" onClick={() => setShowAddProduct(true)}>
            + Add Product
          </button>
        </div>

        {showAddProduct && (
          <div className="add-form">
            <h4>Add New Product</h4>
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
              <select
                value={newProduct.department}
                onChange={(e) => setNewProduct({ ...newProduct, department: e.target.value })}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <button className="save-btn" onClick={handleAddProduct}>
                Save
              </button>
              <button className="cancel-btn" onClick={() => setShowAddProduct(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {DEPARTMENTS.map((dept) => (
          <div key={dept} className="department-products">
            <h4 style={{ color: getDepartmentColor(dept), marginBottom: "1rem" }}>
               {dept} Department ({stockByDepartment[dept].length} products)
            </h4>

            {stockByDepartment[dept].length > 0 ? (
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
                    {stockByDepartment[dept].map((item) => (
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
                            <span className={item.alert_status === "LOW_STOCK" ? "low-stock-text" : ""}>
                              {item.quantity}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingProduct === item.id ? (
                            <input
                              type="number"
                              value={item.threshold_value}
                              onChange={(e) =>
                                setStock(
                                  stock.map((s) => (s.id === item.id ? { ...s, threshold_value: e.target.value } : s)),
                                )
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
            ) : (
              <p style={{ color: "#7f8c8d", fontStyle: "italic", marginBottom: "2rem" }}>
                No products in this department
              </p>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderStockRequestsTab = () => {
    return (
      <div className="manage-section">
        <div className="section-header">
          <h3>
            Low Stock Requests
            {pendingRequestsCount > 0 && <span className="notification-badge">{pendingRequestsCount}</span>}
          </h3>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Stock Item</th>
                <th>Department</th>
                <th>Current Stock</th>
                <th>Threshold</th>
                <th>Requested By</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Approved By</th>
                <th>Approval Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockRequests.map((request) => (
                <tr key={request.id} className={request.status === "PENDING" ? "pending-request" : ""}>
                  <td>{request.id}</td>
                  <td>
                    <strong>{request.item_name}</strong>
                    {request.status === "PENDING" && <span className="alert-icon">⚠️</span>}
                  </td>
                  <td>
                    <span
                      className="department-badge"
                      style={{ backgroundColor: getDepartmentColor(request.department) }}
                    >
                      {request.department}
                    </span>
                  </td>
                  <td>
                    <span className={request.quantity <= request.threshold_value ? "low-stock-text" : ""}>
                      {request.quantity} units
                    </span>
                  </td>
                  <td>{request.threshold_value} units</td>
                  <td>{request.requested_by_name}</td>
                  <td>{formatDate(request.request_date)}</td>
                  <td>
                    <span className={`status-badge ${request.status.toLowerCase()}`}>
                      {request.status}
                      {request.status === "APPROVED" && <span className="vendor-notified"> ✉️ Vendor Notified</span>}
                    </span>
                  </td>
                  <td>{request.approved_by_name || "N/A"}</td>
                  <td>{request.approval_date ? formatDate(request.approval_date) : "N/A"}</td>
                  <td>
                    {request.status === "PENDING" && (
                      <div className="action-buttons">
                        <button className="approve-btn" onClick={() => handleApproveRequest(request.id)}>
                          ✅ Approve & Notify Vendor
                        </button>
                        <button className="reject-btn" onClick={() => handleRejectRequest(request.id)}>
                          ❌ Reject
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
  }

  const renderReportsTab = () => (
    <div className="reports-section">
      <div className="section-header">
        <h3> Analytics & Reports</h3>
      </div>

      {reports && (
        <>
          <StockAnalytics reports={reports} onExportChart={handleExportChart} />
          <ReportExporter reports={reports} />
          <div className="reports-summary">
            <div className="summary-cards">
              <div className="summary-card">
                <h4>Stock Overview</h4>
                <div className="summary-stats">
                  <p>
                    Total Products: <strong>{reports.stockSummary?.total_products || 0}</strong>
                  </p>
                  <p>
                    Total Stock: <strong>{reports.stockSummary?.total_stock || 0}</strong>
                  </p>
                  <p>
                    Low Stock Items: <strong>{reports.stockSummary?.low_stock_count || 0}</strong>
                  </p>
                </div>
              </div>

              <div className="summary-card">
                <h4>Team Overview</h4>
                <div className="summary-stats">
                  <p>
                    Total Users: <strong>{reports.operatorsSummary?.total_operators || 0}</strong>
                  </p>
                  <p>
                    Active Operators: <strong>{reports.operatorsSummary?.operators_count || 0}</strong>
                  </p>
                  <p>
                    Supervisors: <strong>{reports.operatorsSummary?.supervisors_count || 0}</strong>
                  </p>
                </div>
              </div>
            </div>

            {reports.stockByDepartment && (
              <div className="department-breakdown">
                <h4>Department Stock Status</h4>
                <div className="summary-cards">
                  {reports.stockByDepartment.map((dept) => (
                    <div key={dept.department} className="summary-card">
                      <h5 style={{ color: getDepartmentColor(dept.department) }}>🏭 {dept.department}</h5>
                      <div className="summary-stats">
                        <p>
                          Products: <strong>{dept.total_products}</strong>
                        </p>
                        <p>
                          Total Stock: <strong>{dept.total_stock}</strong>
                        </p>
                        <p>
                          Low Stock: <strong>{dept.low_stock_count}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )

  const handleAddVendor = async () => {
    try {
      await axios.post(`${BACKEND_URL}/vendors`, newVendor)
      setNewVendor({
        name: "",
        email: "",
        phone: "",
        address: "",
        contact_person: "",
      })
      setShowAddVendor(false)
      fetchVendors()
      alert("Vendor added successfully!")
    } catch (error) {
      console.error("Failed to add vendor:", error)
      alert("Failed to add vendor: " + (error.response?.data?.message || "Server error"))
    }
  }

  const renderVendorsTab = () => {
    return (
      <div className="manage-section">
        <div className="section-header">
          <h3> Manage Vendors</h3>
          <button className="add-btn" onClick={() => setShowAddVendor(true)}>
            + Add Vendor
          </button>
        </div>

        {showAddVendor && (
          <div className="add-form">
            <h4>Add New Vendor</h4>
            <div className="form-row">
              <input
                type="text"
                placeholder="Vendor Name"
                value={newVendor.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newVendor.email}
                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newVendor.phone}
                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Contact Person"
                value={newVendor.contact_person}
                onChange={(e) => setNewVendor({ ...newVendor, contact_person: e.target.value })}
              />
              <input
                type="text"
                placeholder="Address"
                value={newVendor.address}
                onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                style={{ minWidth: "300px" }}
              />
            </div>
            <div className="form-row">
              <button className="save-btn" onClick={handleAddVendor}>
                Save Vendor
              </button>
              <button className="cancel-btn" onClick={() => setShowAddVendor(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vendor Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Contact Person</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td>{vendor.id}</td>
                  <td>
                    <strong>{vendor.name}</strong>
                  </td>
                  <td>{vendor.email}</td>
                  <td>{vendor.phone}</td>
                  <td>{vendor.contact_person}</td>
                  <td>{vendor.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <div className="tab-content">
          {activeTab === "dashboard" && renderDashboardTab()}
          {activeTab === "manage-operators" && renderManageOperatorsTab()}
          {activeTab === "manage-products" && renderManageProductsTab()}
          {activeTab === "reports" && renderReportsTab()}
          {activeTab === "stock-requests" && renderStockRequestsTab()}
          {activeTab === "vendors" && renderVendorsTab()}
        </div>
      </div>
      <FloatingChatbot />
    </div>
  )
}

export default AdminDashboard

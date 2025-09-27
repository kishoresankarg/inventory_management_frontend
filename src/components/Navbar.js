"use client"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../styles/Navbar.css"

const Navbar = ({ operator, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const navigate = useNavigate()

  // Update the useEffect to also listen for admin tab changes
  useEffect(() => {
    // Listen for active tab changes from SupervisorDashboard and AdminDashboard
    const handleActiveTabChange = (event) => {
      setActiveTab(event.detail)
    }

    const handleAdminActiveTabChange = (event) => {
      setActiveTab(event.detail)
    }

    window.addEventListener("supervisorActiveTabChange", handleActiveTabChange)
    window.addEventListener("adminActiveTabChange", handleAdminActiveTabChange)

    return () => {
      window.removeEventListener("supervisorActiveTabChange", handleActiveTabChange)
      window.removeEventListener("adminActiveTabChange", handleAdminActiveTabChange)
    }
  }, [])

  const handleLogout = () => {
    onLogout()
    navigate("/")
  }

  const getDashboardLink = () => {
    switch (operator.role) {
      case "operator":
        return "/operator-dashboard"
      case "supervisor":
        return "/supervisor-dashboard"
      case "admin":
        return "/admin-dashboard"
      default:
        return "/dashboard"
    }
  }

  const getRoleColor = () => {
    switch (operator.role) {
      case "operator":
        return "#3498db"
      case "supervisor":
        return "#f39c12"
      case "admin":
        return "#e74c3c"
      default:
        return "#666"
    }
  }

  // Function to handle tab switching for supervisor
  const handleSupervisorTabClick = (tab, event) => {
    event.preventDefault()
    setActiveTab(tab)
    // Dispatch custom event to communicate with SupervisorDashboard
    window.dispatchEvent(new CustomEvent("supervisorTabChange", { detail: tab }))
  }

  // Add this after the handleSupervisorTabClick function

  // Function to handle tab switching for admin
  const handleAdminTabClick = (tab, event) => {
    event.preventDefault()
    setActiveTab(tab)
    // Dispatch custom event to communicate with AdminDashboard
    window.dispatchEvent(new CustomEvent("adminTabChange", { detail: tab }))
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to={getDashboardLink()}>📦 Stock Management System</Link>
        </div>

        <div className="navbar-menu">
          {operator.role === "supervisor" ? (
            // Special navigation for supervisors
            <>
              <button
                onClick={(e) => handleSupervisorTabClick("dashboard", e)}
                className={`supervisor-nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
              >
                🏠 Dashboard
              </button>

              <button
                onClick={(e) => handleSupervisorTabClick("manage-stock", e)}
                className={`supervisor-nav-btn ${activeTab === "manage-stock" ? "active" : ""}`}
              >
                📦 Manage Stock
              </button>

              <button
                onClick={(e) => handleSupervisorTabClick("manage-operators", e)}
                className={`supervisor-nav-btn ${activeTab === "manage-operators" ? "active" : ""}`}
              >
                👷‍♂️ Manage Operators
              </button>
            </>
          ) : operator.role === "admin" ? (
            // Special navigation for admins
            <>
              <button
                onClick={(e) => handleAdminTabClick("dashboard", e)}
                className={`supervisor-nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
              >
                🏠 Dashboard
              </button>

              <button
                onClick={(e) => handleAdminTabClick("manage-operators", e)}
                className={`supervisor-nav-btn ${activeTab === "manage-operators" ? "active" : ""}`}
              >
                👷‍♂️ Manage Operators
              </button>

              <button
                onClick={(e) => handleAdminTabClick("manage-products", e)}
                className={`supervisor-nav-btn ${activeTab === "manage-products" ? "active" : ""}`}
              >
                📦 Manage Products
              </button>
               <button
                onClick={(e) => handleAdminTabClick("stock-requests", e)}
                className={`supervisor-nav-btn ${activeTab === "stock-requests" ? "active" : ""}`}
    >
      📋 Low Stock Requests
    </button>

              <button
                onClick={(e) => handleAdminTabClick("reports", e)}
                className={`supervisor-nav-btn ${activeTab === "reports" ? "active" : ""}`}
              >
                📊 Reports
              </button>
            </>
          ) : (
            // Regular navigation for other roles
            <>
              <Link to={getDashboardLink()} className="navbar-item">
                🏠 Dashboard
              </Link>

              <Link to="/update-stock" className="navbar-item">
                📝 Update Stock
              </Link>

              {/* Show additional options for admin */}
              {operator.role === "admin" && (
                <Link to="/stock/alerts" className="navbar-item">
                  ⚠️ Stock Alerts
                </Link>
              )}
               {/* ✅ Billing visible for Operator + Admin */}
    {(operator.role === "operator" || operator.role === "admin") && (
      <Link to="/billing" className="navbar-item">
        🧾 Billing
      </Link>
    )}
            </>
            
          )}
        </div>

        <div className="navbar-user">
          <span className="user-info">
            <span className="username">{operator.username}</span>
            <span className="user-role" style={{ backgroundColor: getRoleColor() }}>
              {operator.role}
            </span>
          </span>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

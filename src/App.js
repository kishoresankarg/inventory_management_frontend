"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import HomePage from "./components/HomePage"
import LoginPage from "./components/LoginPage"
import OperatorDashboard from "./components/OperatorDashboard"
import SupervisorDashboard from "./components/SupervisorDashboard"
import UpdateStock from "./components/UpdateStock"
import Navbar from "./components/Navbar"
import "./App.css"
// Import AdminDashboard at the top
import AdminDashboard from "./components/AdminDashboard"
import BillingPage from "./components/BillingPage"
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [operator, setOperator] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const storedOperator = localStorage.getItem("operator")
    if (storedOperator) {
      setOperator(JSON.parse(storedOperator))
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (operatorData) => {
    localStorage.setItem("operator", JSON.stringify(operatorData))
    setOperator(operatorData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("operator")
    setOperator(null)
    setIsLoggedIn(false)
  }

  // Component to handle role-based dashboard redirects
  const RoleBasedDashboard = () => {
    if (!isLoggedIn || !operator) {
      return <Navigate to="/login" replace />
    }

    // Route to specific dashboard based on role
    if (operator.role === "operator") {
      return (
        <>
          <Navbar operator={operator} onLogout={handleLogout} />
          <OperatorDashboard operator={operator} />
        </>
      )
    } else if (operator.role === "supervisor") {
      return (
        <>
          <Navbar operator={operator} onLogout={handleLogout} />
          <SupervisorDashboard operator={operator} />
        </>
      )
    } else if (operator.role === "admin") {
      return (
        <>
          <Navbar operator={operator} onLogout={handleLogout} />
          <AdminDashboard operator={operator} />
        </>
      )
    }

    // Fallback for unknown roles
    return <Navigate to="/login" replace />
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/login"
            element={!isLoggedIn ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" replace />}
          />

          {/* Generic dashboard route that handles role-based redirects */}
          <Route path="/dashboard" element={<RoleBasedDashboard />} />

          {/* Specific role-based dashboard routes */}
          <Route
            path="/operator-dashboard"
            element={
              isLoggedIn && operator?.role === "operator" ? (
                <>
                  <Navbar operator={operator} onLogout={handleLogout} />
                  <OperatorDashboard operator={operator} />
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/supervisor-dashboard"
            element={
              isLoggedIn && operator?.role === "supervisor" ? (
                <>
                  <Navbar operator={operator} onLogout={handleLogout} />
                  <SupervisorDashboard operator={operator} />
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              isLoggedIn && operator?.role === "admin" ? (
                <>
                  <Navbar operator={operator} onLogout={handleLogout} />
                  <AdminDashboard operator={operator} />
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/update-stock"
            element={
              isLoggedIn ? (
                <>
                  <Navbar operator={operator} onLogout={handleLogout} />
                  <UpdateStock operator={operator} />
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
  path="/billing"
  element={
    isLoggedIn && (operator?.role === "operator" || operator?.role === "admin") ? (
      <>
        <Navbar operator={operator} onLogout={handleLogout} />
        <BillingPage operator={operator} />   {/* ✅ operator is passed here */}
      </>
    ) : (
      <Navigate to="/login" replace />
    )
  }
/>


          {/* Catch-all route */}
          <Route path="*" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

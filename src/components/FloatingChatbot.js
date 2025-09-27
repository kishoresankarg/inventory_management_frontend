"use client"

// client/src/components/FloatingChatbot.js
import { useState } from "react"
import "./FloatingChatbot.css"
import { BACKEND_URL } from "../constants"

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: 'Hi! I can help you with:\n Individual item stock ("grinding steel stock?")\n Low stock alerts ("show low stock items")\n\n Complete inventory ("show all stock")\n Daily reports ("report for 2024-01-15")\n Monthly reports ("monthly report for January 2024")\n\nWhat would you like to know?',
    },
  ])
  const [input, setInput] = useState("")

  const parseDate = (dateStr) => {
    const today = new Date()
    const lowerStr = dateStr.toLowerCase()

    // Handle relative dates
    if (lowerStr.includes("today")) {
      return today.toISOString().split("T")[0]
    }
    if (lowerStr.includes("yesterday")) {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return yesterday.toISOString().split("T")[0]
    }

    // Handle specific date formats (YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY)
    const datePatterns = [
      /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY or MM/DD/YYYY
      /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY or MM-DD-YYYY
    ]

    for (const pattern of datePatterns) {
      const match = dateStr.match(pattern)
      if (match) {
        if (pattern === datePatterns[0]) {
          // YYYY-MM-DD
          return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`
        } else {
          // DD/MM/YYYY or MM/DD/YYYY format
          const day = match[1].padStart(2, "0")
          const month = match[2].padStart(2, "0")
          const year = match[3]
          return `${year}-${month}-${day}`
        }
      }
    }

    return null
  }

  const parseMonth = (monthStr) => {
    const months = {
      january: "01",
      jan: "01",
      february: "02",
      feb: "02",
      march: "03",
      mar: "03",
      april: "04",
      apr: "04",
      may: "05",
      june: "06",
      jun: "06",
      july: "07",
      jul: "07",
      august: "08",
      aug: "08",
      september: "09",
      sep: "09",
      october: "10",
      oct: "10",
      november: "11",
      nov: "11",
      december: "12",
      dec: "12",
    }

    const lowerStr = monthStr.toLowerCase()

    // Handle "January 2024" or "Jan 2024" format
    const monthYearPattern = /(\w+)\s+(\d{4})/
    const match = lowerStr.match(monthYearPattern)

    if (match) {
      const monthName = match[1]
      const year = match[2]
      const monthNum = months[monthName]

      if (monthNum) {
        return `${year}-${monthNum}`
      }
    }

    // Handle current month if just month name is provided
    const currentYear = new Date().getFullYear()
    for (const [name, num] of Object.entries(months)) {
      if (lowerStr.includes(name)) {
        return `${currentYear}-${num}`
      }
    }

    return null
  }

  // Extract item or detect special queries from user message
  const extractItem = (msg) => {
    const lowerMsg = msg.toLowerCase()

    const dailyReportPatterns = [
      /(?:daily|day|date).*?report.*?(?:for|on)\s+(.+?)(?:\?|$|please|thanks)/i,
      /report.*?(?:for|on)\s+(.+?)(?:\?|$|please|thanks)/i,
      /(?:generate|show|get).*?report.*?(.+?)(?:\?|$)/i,
      /(?:stock|inventory).*?report.*?(?:for|on)\s+(.+?)(?:\?|$)/i,
    ]

    for (const pattern of dailyReportPatterns) {
      const match = lowerMsg.match(pattern)
      if (match && match[1]) {
        const dateStr = match[1].trim()
        const parsedDate = parseDate(dateStr)
        if (parsedDate) {
          return { type: "DAILY_REPORT", date: parsedDate }
        }
      }
    }

    const monthlyReportPatterns = [
      /(?:monthly|month).*?report.*?(?:for|of)\s+(.+?)(?:\?|$|please|thanks)/i,
      /report.*?(?:for|of).*?month.*?(.+?)(?:\?|$)/i,
      /(?:generate|show|get).*?monthly.*?(.+?)(?:\?|$)/i,
    ]

    for (const pattern of monthlyReportPatterns) {
      const match = lowerMsg.match(pattern)
      if (match && match[1]) {
        const monthStr = match[1].trim()
        const parsedMonth = parseMonth(monthStr)
        if (parsedMonth) {
          return { type: "MONTHLY_REPORT", month: parsedMonth }
        }
      }
    }

    // Check for low stock queries first
    const lowStockPatterns = [
      /(?:low|critical|alert|shortage|running out|almost empty).*?stock/i,
      /(?:what|which|tell me|show me|list).*?(?:items?|products?).*?(?:low|critical|alert|shortage)/i,
      /(?:stock|inventory).*?(?:alert|warning|low|critical)/i,
      /(?:items?|products?).*?(?:need|require|should).*?(?:restock|refill|order)/i,
      /(?:below|under).*?threshold/i,
    ]

    for (const pattern of lowStockPatterns) {
      if (pattern.test(lowerMsg)) {
        return "LOW_STOCK_QUERY"
      }
    }

    // Check for all stock/inventory queries
    const allStockPatterns = [
      /(?:all|entire|complete|full).*?(?:stock|inventory|items?|products?)/i,
      /(?:what|show me|list|tell me).*?(?:all|everything|complete).*?(?:stock|inventory)/i,
      /(?:total|complete|full).*?(?:inventory|stock|items?)/i,
    ]

    for (const pattern of allStockPatterns) {
      if (pattern.test(lowerMsg)) {
        return "ALL_STOCK_QUERY"
      }
    }

    // Regular item extraction patterns
    const patterns = [
      /(?:stock|quantity|check|how much|how many).*?(?:for|of)\s+(.+?)(?:\?|$|please|thanks)/i,
      /(.+?)\s+(?:stock|quantity|available)/i,
      /(?:what.*?stock.*?|check.*?)(.+?)(?:\?|$)/i,
      /(.+?)\s+(?:left|remaining)/i,
    ]

    for (const pattern of patterns) {
      const match = lowerMsg.match(pattern)
      if (match && match[1]) {
        return match[1].trim().toLowerCase()
      }
    }

    const productKeywords = [
      
    ]

    const words = lowerMsg.split(" ")
    const foundKeyword = productKeywords.find((keyword) =>
      words.some((word) => word.includes(keyword) || keyword.includes(word)),
    )

    return foundKeyword || null
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMsg = { from: "user", text: input }
    setMessages((prev) => [...prev, userMsg])

    try {
      const extractedItem = extractItem(input)

      if (extractedItem && extractedItem.type === "DAILY_REPORT") {
        const res = await fetch(`${BACKEND_URL}/reports/daily/${extractedItem.date}`)
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            const report = data.data
            const botMsg = {
              from: "bot",
              text:
                `📊 DAILY REPORT - ${extractedItem.date}\n\n` +
                `📦 Total Transactions: ${report.totalTransactions || 0}\n` +
                `📈 Items Added: ${report.itemsAdded || 0}\n` +
                `📉 Items Removed: ${report.itemsRemoved || 0}\n` +
                `📈 Total items Added: ${report.itemsAdded || 0}\n` +
                `📉 Total items Removed: ${report.itemsRemoved || 0}\n` +
                `${
                  report.transactions && report.transactions.length > 0
                    ? `Recent Transactions:\n${report.transactions
                        .slice(0, 5)
                        .map((t) => ` ${t.item_name}: ${t.type === "IN" ? "+" : "-"}${t.quantity} (${t.time})`)
                        .join("\n")}`
                    : "No transactions found for this date."
                }`,
            }
            setMessages((prev) => [...prev, botMsg])
          } else {
            const botMsg = {
              from: "bot",
              text: `No data found for ${extractedItem.date}. Please check the date format (YYYY-MM-DD).`,
            }
            setMessages((prev) => [...prev, botMsg])
          }
        } else {
          throw new Error("Failed to fetch daily report")
        }
        setInput("")
        return
      }

      if (extractedItem && extractedItem.type === "MONTHLY_REPORT") {
        const res = await fetch(`${BACKEND_URL}/reports/monthly/${extractedItem.month}`)
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            const report = data.data
            const [year, month] = extractedItem.month.split("-")
            const monthNames = [
              "",
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ]

            const botMsg = {
              from: "bot",
              text:
                `📊 MONTHLY REPORT - ${monthNames[Number.parseInt(month)]} ${year}\n\n` +
                `📦 Total Transactions: ${report.totalTransactions || 0}\n` +
                `📈 Items Added: ${report.itemsAdded || 0}\n` +
                `📉 Items Removed: ${report.itemsRemoved || 0}\n` +
                `${
                  report.categoryBreakdown && Object.keys(report.categoryBreakdown).length > 0
                    ? `Category Breakdown:\n${Object.entries(report.categoryBreakdown)
                        .map(([cat, val]) => ` ${cat}: ${val.transactions} transactions, $${val.totalValue} value`)
                        .join("\n")}`
                    : "No category data available."
                }\n\n` +
                `${
                  report.topItems && report.topItems.length > 0
                    ? `Most Active Items:\n${report.topItems
                        .slice(0, 5)
                        .map((item, idx) => `${idx + 1}. ${item.item_name}: ${item.total_transactions} transactions`)
                        .join("\n")}`
                    : ""
                }`,
            }
            setMessages((prev) => [...prev, botMsg])
          } else {
            const botMsg = {
              from: "bot",
              text: `No data found for ${extractedItem.month}. Please check the month format.`,
            }
            setMessages((prev) => [...prev, botMsg])
          }
        } else {
          throw new Error("Failed to fetch monthly report")
        }
        setInput("")
        return
      }

      // Handle low stock queries
      if (extractedItem === "LOW_STOCK_QUERY") {
        const res = await fetch(`${BACKEND_URL}/stock/alerts`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.lowStockCount > 0) {
            const lowStockList = data.data
              .filter((item) => item.alert_status === "LOW_STOCK")
              .map((item) => ` ${item.item_name}: ${item.quantity} units (threshold: ${item.threshold_value})`)
              .join("\n")

            const botMsg = {
              from: "bot",
              text: `⚠️ LOW STOCK ALERT!\n\nFound ${data.lowStockCount} items below threshold:\n\n${lowStockList}\n\nThese items need immediate restocking!`,
            }
            setMessages((prev) => [...prev, botMsg])
          } else {
            const botMsg = {
              from: "bot",
              text: "✅ Great news! All items are currently above their minimum stock thresholds.",
            }
            setMessages((prev) => [...prev, botMsg])
          }
        } else {
          throw new Error("Failed to fetch low stock data")
        }
        setInput("")
        return
      }

      // Handle all stock queries
      if (extractedItem === "ALL_STOCK_QUERY") {
        const res = await fetch(`${BACKEND_URL}/stock`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data.length > 0) {
            const stockList = data.data
              .map((item) => {
                const alertIcon = item.alert_status === "LOW_STOCK" ? "⚠️" : "✅"
                return `${alertIcon} ${item.item_name}: ${item.quantity} units`
              })
              .join("\n")

            const lowStockCount = data.data.filter((item) => item.alert_status === "LOW_STOCK").length
            const totalItems = data.data.length

            const botMsg = {
              from: "bot",
              text: `📦 COMPLETE INVENTORY (${totalItems} items):\n\n${stockList}\n\n📊 Summary: ${lowStockCount} items need restocking, ${totalItems - lowStockCount} items are well-stocked.`,
            }
            setMessages((prev) => [...prev, botMsg])
          } else {
            const botMsg = {
              from: "bot",
              text: "📦 No items found in inventory.",
            }
            setMessages((prev) => [...prev, botMsg])
          }
        } else {
          throw new Error("Failed to fetch inventory data")
        }
        setInput("")
        return
      }

      // Handle specific item queries
      if (!extractedItem) {
        const botMsg = {
          from: "bot",
          text: "I couldn't identify what you're asking about. Try:\n 'Show me low stock items'\n 'What's the steel grinding stock?'\n 'Tell me all inventory'\n 'Report for 2024-01-15'\n 'Monthly report for January 2024'",
        }
        setMessages((prev) => [...prev, botMsg])
        setInput("")
        return
      }

      const res = await fetch(`${BACKEND_URL}/get-stock/${extractedItem}`)

      if (res.ok) {
        const contentType = res.headers.get("content-type")
        let data

        if (contentType && contentType.includes("application/json")) {
          const jsonData = await res.json()
          data = jsonData.message || JSON.stringify(jsonData, null, 2)
        } else {
          data = await res.text()
        }

        const botMsg = { from: "bot", text: data }
        setMessages((prev) => [...prev, botMsg])
      } else {
        const botMsg = {
          from: "bot",
          text: "Sorry, I encountered an error checking the stock. Please try again.",
        }
        setMessages((prev) => [...prev, botMsg])
      }
    } catch (error) {
      console.error("Error:", error)
      const botMsg = {
        from: "bot",
        text: "Sorry, I couldn't connect to the stock system. Please try again later.",
      }
      setMessages((prev) => [...prev, botMsg])
    }

    setInput("")
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const closeChat = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Chat Icon */}
      <div className={`floating-chat-icon ${isOpen ? "hidden" : ""}`} onClick={toggleChat}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 15.01 3.01 16.31L2 22L7.69 20.99C8.99 21.64 10.46 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C10.74 20 9.54 19.75 8.46 19.3L6.5 19.85L7.05 17.89C6.6 16.81 6.35 15.61 6.35 14.35C6.35 9.25 9.25 6.35 14.35 6.35C19.45 6.35 22.35 9.25 22.35 14.35C22.35 19.45 19.45 22.35 14.35 22.35H12V20Z"
            fill="white"
          />
          <circle cx="9" cy="12" r="1" fill="white" />
          <circle cx="12" cy="12" r="1" fill="white" />
          <circle cx="15" cy="12" r="1" fill="white" />
        </svg>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="floating-chatbot-container">
          {/* Header */}
          <div className="floating-chatbot-header">
            <h3>Warehouse Stock Assistant</h3>
            <button className="close-chat-btn" onClick={closeChat}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="floating-chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`floating-message ${msg.from}`}>
                <div className="floating-message-content">{msg.text}</div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="floating-chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about stock or reports..."
            />
            <button onClick={sendMessage}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default FloatingChatbot;

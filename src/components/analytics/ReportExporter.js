"use client"

import { useState } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

const ReportExporter = ({ reports, onExport }) => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState("pdf")

  const exportToPDF = async (includeCharts = true) => {
    setIsExporting(true)
    try {
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPosition = 20

      // Header
      pdf.setFontSize(20)
      pdf.setTextColor(44, 62, 80)
      pdf.text("Shakthi Stockpoint - Analytics Report", 20, yPosition)
      yPosition += 15

      pdf.setFontSize(12)
      pdf.setTextColor(107, 114, 128)
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition)
      yPosition += 20

      // Executive Summary
      pdf.setFontSize(16)
      pdf.setTextColor(44, 62, 80)
      pdf.text("Executive Summary", 20, yPosition)
      yPosition += 10

      pdf.setFontSize(10)
      pdf.setTextColor(0, 0, 0)

      if (reports?.stockSummary) {
        const summary = [
          `Total Products: ${reports.stockSummary.total_products}`,
          `Total Stock: ${reports.stockSummary.total_stock}`,
          `Low Stock Items: ${reports.stockSummary.low_stock_count}`,
          `Average Stock per Product: ${Math.round(reports.stockSummary.avg_stock_per_product)}`,
        ]

        summary.forEach((line) => {
          pdf.text(line, 25, yPosition)
          yPosition += 6
        })
      }

      yPosition += 10

      // Department Analysis
      pdf.setFontSize(16)
      pdf.setTextColor(44, 62, 80)
      pdf.text("Department Analysis", 20, yPosition)
      yPosition += 10

      if (reports?.stockByDepartment) {
        reports.stockByDepartment.forEach((dept) => {
          pdf.setFontSize(12)
          pdf.setTextColor(52, 152, 219)
          pdf.text(`${dept.department} Department:`, 25, yPosition)
          yPosition += 8

          pdf.setFontSize(10)
          pdf.setTextColor(0, 0, 0)
          const deptData = [
            `Products: ${dept.total_products}`,
            `Total Stock: ${dept.total_stock}`,
            `Low Stock Items: ${dept.low_stock_count}`,
            `Average Stock: ${Math.round(dept.avg_stock_per_product)}`,
          ]

          deptData.forEach((line) => {
            pdf.text(`  • ${line}`, 30, yPosition)
            yPosition += 5
          })
          yPosition += 5

          if (yPosition > pageHeight - 30) {
            pdf.addPage()
            yPosition = 20
          }
        })
      }

      // Recent Updates
      if (reports?.recentUpdates && reports.recentUpdates.length > 0) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage()
          yPosition = 20
        }

        pdf.setFontSize(16)
        pdf.setTextColor(44, 62, 80)
        pdf.text("Recent Stock Updates", 20, yPosition)
        yPosition += 10

        reports.recentUpdates.slice(0, 10).forEach((update) => {
          pdf.setFontSize(10)
          pdf.setTextColor(0, 0, 0)
          const updateText = `${update.item_name} (${update.department}): ${update.quantity} units - Updated by ${update.updated_by}`
          pdf.text(updateText, 25, yPosition)
          yPosition += 6

          if (yPosition > pageHeight - 20) {
            pdf.addPage()
            yPosition = 20
          }
        })
      }

      if (includeCharts) {
        const chartTabs = ["overview", "departments", "alerts"]
        const chartTitles = ["Overview Charts", "Department Analysis", "Alerts Dashboard"]

        // Get the current active tab to restore later
        const currentTab = document.querySelector(".chart-tab.active")?.textContent?.includes("Overview")
          ? "overview"
          : document.querySelector(".chart-tab.active")?.textContent?.includes("Departments")
            ? "departments"
            : "alerts"

        for (let i = 0; i < chartTabs.length; i++) {
          // Click the corresponding tab to make it active
          const tabButtons = document.querySelectorAll(".chart-tab")
          if (tabButtons[i]) {
            tabButtons[i].click()
            // Wait for the chart to render
            await new Promise((resolve) => setTimeout(resolve, 500))
          }

          const chartElement = document.getElementById(`${chartTabs[i]}-charts`)

          if (chartElement) {
            pdf.addPage()
            yPosition = 20

            pdf.setFontSize(16)
            pdf.setTextColor(44, 62, 80)
            pdf.text(chartTitles[i], 20, yPosition)
            yPosition += 15

            try {
              const canvas = await html2canvas(chartElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
              })

              const imgData = canvas.toDataURL("image/png")
              const imgWidth = pageWidth - 40
              const imgHeight = (canvas.height * imgWidth) / canvas.width

              pdf.addImage(imgData, "PNG", 20, yPosition, imgWidth, imgHeight)
            } catch (error) {
              console.error(`Error capturing ${chartTitles[i]}:`, error)
            }
          }
        }

        // Restore the original active tab
        const tabButtons = document.querySelectorAll(".chart-tab")
        const restoreIndex = chartTabs.indexOf(currentTab)
        if (tabButtons[restoreIndex]) {
          tabButtons[restoreIndex].click()
        }
      }

      // Save the PDF
      pdf.save(`Shakthi_Stockpoint_Report_${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF report")
    } finally {
      setIsExporting(false)
    }
  }

  const exportToCSV = (type) => {
    let csvContent = "data:text/csv;charset=utf-8,"
    let filename = ""

    switch (type) {
      case "stock":
        csvContent += "Department,Product Name,Quantity,Last Updated,Updated By\n"
        if (reports?.recentUpdates) {
          reports.recentUpdates.forEach((item) => {
            csvContent += `${item.department},"${item.item_name}",${item.quantity},"${new Date(
              item.last_updated,
            ).toLocaleString()}","${item.updated_by}"\n`
          })
        }
        filename = `stock_report_${new Date().toISOString().split("T")[0]}.csv`
        break

      case "departments":
        csvContent += "Department,Total Products,Total Stock,Low Stock Count,Average Stock\n"
        if (reports?.stockByDepartment) {
          reports.stockByDepartment.forEach((dept) => {
            csvContent += `${dept.department},${dept.total_products},${dept.total_stock},${
              dept.low_stock_count
            },${Math.round(dept.avg_stock_per_product)}\n`
          })
        }
        filename = `department_analysis_${new Date().toISOString().split("T")[0]}.csv`
        break

      case "alerts":
        csvContent += "Department,Product Name,Current Quantity,Alert Level\n"
        if (reports?.recentUpdates) {
          reports.recentUpdates.forEach((item) => {
            const alertLevel = item.quantity <= 10 ? "Low Stock" : "Normal"
            csvContent += `${item.department},"${item.item_name}",${item.quantity},"${alertLevel}"\n`
          })
        }
        filename = `alerts_report_${new Date().toISOString().split("T")[0]}.csv`
        break

      case "lowstock":
        csvContent += "Department,Product Name,Current Quantity,Threshold,Stock Status,Alert Timestamp\n"
        if (reports?.recentUpdates) {
          reports.recentUpdates
            .filter((item) => item.quantity <= 10)
            .forEach((item) => {
              const alertTimestamp = new Date().toLocaleString()
              csvContent += `${item.department},"${item.item_name}",${item.quantity},10,"Low Stock","${alertTimestamp}"\n`
            })
        }
        filename = `low_stock_alerts_${new Date().toISOString().split("T")[0]}.csv`
        break

      case "dayreport":
        const selectedDate = document.getElementById("dateFilter")?.value || new Date().toISOString().split("T")[0]
        csvContent += "Date,Department,Product Name,Quantity,Last Updated,Updated By,Stock Status\n"
        if (reports?.recentUpdates) {
          reports.recentUpdates
            .filter((item) => {
              const itemDate = new Date(item.last_updated).toISOString().split("T")[0]
              return itemDate === selectedDate
            })
            .forEach((item) => {
              const stockStatus = item.quantity <= 10 ? "Low Stock" : "Normal Stock"
              csvContent += `${selectedDate},${item.department},"${item.item_name}",${item.quantity},"${new Date(
                item.last_updated,
              ).toLocaleString()}","${item.updated_by}","${stockStatus}"\n`
            })
        }
        filename = `day_report_${selectedDate}.csv`
        break

      default:
        return
    }

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportChartImage = async () => {
    try {
      const chartTabs = ["overview", "departments", "alerts"]
      const chartTitles = ["Overview Charts", "Department Analysis", "Alerts Dashboard"]

      // Get the current active tab to restore later
      const currentTab = document.querySelector(".chart-tab.active")?.textContent?.includes("Overview")
        ? "overview"
        : document.querySelector(".chart-tab.active")?.textContent?.includes("Departments")
          ? "departments"
          : "alerts"

      // Create a container to hold all three chart views
      const allChartsContainer = document.createElement("div")
      allChartsContainer.style.backgroundColor = "#ffffff"
      allChartsContainer.style.padding = "20px"
      allChartsContainer.style.position = "absolute"
      allChartsContainer.style.left = "-9999px"
      allChartsContainer.style.top = "0"
      allChartsContainer.style.width = "1200px"

      // Add main title
      const mainTitle = document.createElement("h2")
      mainTitle.textContent = "Shakthi Stockpoint - Complete Analytics Report"
      mainTitle.style.textAlign = "center"
      mainTitle.style.marginBottom = "30px"
      mainTitle.style.color = "#2c3e50"
      mainTitle.style.fontSize = "28px"
      allChartsContainer.appendChild(mainTitle)

      // Clone and append all three chart views
      for (let i = 0; i < chartTabs.length; i++) {
        // Click the corresponding tab to make it active
        const tabButtons = document.querySelectorAll(".chart-tab")
        if (tabButtons[i]) {
          tabButtons[i].click()
          // Wait for the chart to render
          await new Promise((resolve) => setTimeout(resolve, 500))
        }

        const chartElement = document.getElementById(`${chartTabs[i]}-charts`)
        if (chartElement) {
          // Add section title
          const sectionTitle = document.createElement("h3")
          sectionTitle.textContent = chartTitles[i]
          sectionTitle.style.color = "#34495e"
          sectionTitle.style.fontSize = "20px"
          sectionTitle.style.marginTop = i > 0 ? "40px" : "20px"
          sectionTitle.style.marginBottom = "15px"
          sectionTitle.style.borderBottom = "2px solid #3498db"
          sectionTitle.style.paddingBottom = "5px"
          allChartsContainer.appendChild(sectionTitle)

          const chartClone = chartElement.cloneNode(true)
          chartClone.style.marginBottom = "30px"
          chartClone.style.border = "1px solid #e0e0e0"
          chartClone.style.borderRadius = "8px"
          chartClone.style.padding = "15px"
          chartClone.style.backgroundColor = "#ffffff"
          allChartsContainer.appendChild(chartClone)
        }
      }

      // Restore the original active tab
      const tabButtons = document.querySelectorAll(".chart-tab")
      const restoreIndex = chartTabs.indexOf(currentTab)
      if (tabButtons[restoreIndex]) {
        tabButtons[restoreIndex].click()
      }

      document.body.appendChild(allChartsContainer)

      // Capture the combined charts
      const canvas = await html2canvas(allChartsContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 1200,
        height: allChartsContainer.scrollHeight,
      })

      // Remove the temporary container
      document.body.removeChild(allChartsContainer)

      const filename = `complete_analytics_report_${new Date().toISOString().split("T")[0]}.png`
      const link = document.createElement("a")
      link.download = filename
      link.href = canvas.toDataURL("image/png", 1.0)
      link.click()
    } catch (error) {
      console.error("Error exporting charts:", error)
      alert("Error exporting charts. Please try again.")
    }
  }

  return (
    <div className="export-section">
      <div className="export-header">
        <h4>📊 Export Reports</h4>
        <div className="export-format-selector">
          <label>
            <input
              type="radio"
              value="pdf"
              checked={exportFormat === "pdf"}
              onChange={(e) => setExportFormat(e.target.value)}
            />
            PDF Report
          </label>
          <label>
            <input
              type="radio"
              value="csv"
              checked={exportFormat === "csv"}
              onChange={(e) => setExportFormat(e.target.value)}
            />
            CSV Data
          </label>
          <label>
            <input
              type="radio"
              value="image"
              checked={exportFormat === "image"}
              onChange={(e) => setExportFormat(e.target.value)}
            />
            Chart Images
          </label>
        </div>
      </div>

      <div className="export-buttons">
        {exportFormat === "pdf" && (
          <>
            <button className="export-btn comprehensive" onClick={() => exportToPDF(true)} disabled={isExporting}>
              {isExporting ? "⏳ Generating..." : "📊 Complete Report with Charts"}
            </button>
            <button className="export-btn summary" onClick={() => exportToPDF(false)} disabled={isExporting}>
              📄 Summary Report Only
            </button>
          </>
        )}

        {exportFormat === "csv" && (
          <>
            <button className="export-btn" onClick={() => exportToCSV("stock")}>
              📦 Stock Data CSV
            </button>
            <button className="export-btn" onClick={() => exportToCSV("departments")}>
              🏭 Department Analysis CSV
            </button>
            <button className="export-btn" onClick={() => exportToCSV("alerts")}>
              🚨 Alerts Report CSV
            </button>
            <div className="date-filter-section">
              <label htmlFor="dateFilter">Select Date:</label>
              <input
                type="date"
                id="dateFilter"
                defaultValue={new Date().toISOString().split("T")[0]}
                style={{
                  margin: "0 10px",
                  padding: "5px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              <button className="export-btn" onClick={() => exportToCSV("dayreport")}>
                📅 Download Day Report
              </button>
            </div>
          </>
        )}

        {exportFormat === "image" && (
          <button className="export-btn" onClick={() => exportChartImage()}>
            📊 Download Chart
          </button>
        )}
      </div>
    </div>
  )
}

export default ReportExporter

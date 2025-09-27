// src/api.js
const backendUrl = process.env.REACT_APP_BACKEND_URL;

// ----------------------------
// AUTHENTICATION / LOGIN
// ----------------------------
export const loginOperator = async (username, password) => {
  try {
    const response = await fetch(`${backendUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error("Login failed");
    return await response.json(); // returns operator data including role
  } catch (error) {
    console.error(error);
    return null;
  }
};

// ----------------------------
// PRODUCTS
// ----------------------------
export const getProducts = async () => {
  try {
    const response = await fetch(`${backendUrl}/api/products`);
    if (!response.ok) throw new Error("Failed to fetch products");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await fetch(`${backendUrl}/api/products/${productId}`);
    if (!response.ok) throw new Error("Failed to fetch product");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

// ----------------------------
// STOCK MANAGEMENT
// ----------------------------
export const updateStock = async (productId, quantity) => {
  try {
    const response = await fetch(`${backendUrl}/api/update-stock/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) throw new Error("Failed to update stock");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

// ----------------------------
// BILLING
// ----------------------------
export const createBill = async (billData) => {
  try {
    const response = await fetch(`${backendUrl}/api/billing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(billData),
    });
    if (!response.ok) throw new Error("Failed to create bill");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBills = async () => {
  try {
    const response = await fetch(`${backendUrl}/api/billing`);
    if (!response.ok) throw new Error("Failed to fetch bills");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

// ----------------------------
// OPERATORS (ADMIN)
// ----------------------------
export const getOperators = async () => {
  try {
    const response = await fetch(`${backendUrl}/api/operators`);
    if (!response.ok) throw new Error("Failed to fetch operators");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const addOperator = async (operatorData) => {
  try {
    const response = await fetch(`${backendUrl}/api/operators`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(operatorData),
    });
    if (!response.ok) throw new Error("Failed to add operator");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteOperator = async (operatorId) => {
  try {
    const response = await fetch(`${backendUrl}/api/operators/${operatorId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete operator");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// ----------------------------
// STOCK OPERATIONS
// ----------------------------
export const getStock = async (operatorId = null) => {
  try {
    const url = operatorId 
      ? `${backendUrl}/stock?operatorId=${operatorId}` 
      : `${backendUrl}/stock`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch stock");
    return await response.json();
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
};

export const getStockAlerts = async () => {
  try {
    const response = await fetch(`${backendUrl}/stock/alerts`);
    if (!response.ok) throw new Error("Failed to fetch stock alerts");
    return await response.json();
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
};

export const addStock = async (stockData) => {
  try {
    const response = await fetch(`${backendUrl}/stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stockData),
    });
    if (!response.ok) throw new Error("Failed to add stock");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateStockItem = async (productId, stockData) => {
  try {
    const response = await fetch(`${backendUrl}/stock/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stockData),
    });
    if (!response.ok) throw new Error("Failed to update stock");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteStock = async (productId) => {
  try {
    const response = await fetch(`${backendUrl}/stock/${productId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete stock");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

// ----------------------------
// REPORTS
// ----------------------------
export const getReports = async () => {
  try {
    const response = await fetch(`${backendUrl}/reports`);
    if (!response.ok) throw new Error("Failed to fetch reports");
    return await response.json();
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
};

export const getDailyReport = async (date) => {
  try {
    const response = await fetch(`${backendUrl}/reports/daily/${date}`);
    if (!response.ok) throw new Error("Failed to fetch daily report");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getMonthlyReport = async (month) => {
  try {
    const response = await fetch(`${backendUrl}/reports/monthly/${month}`);
    if (!response.ok) throw new Error("Failed to fetch monthly report");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

// ----------------------------
// VENDORS
// ----------------------------
export const getVendors = async () => {
  try {
    const response = await fetch(`${backendUrl}/vendors`);
    if (!response.ok) throw new Error("Failed to fetch vendors");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

// ----------------------------
// LOW STOCK REQUESTS
// ----------------------------
export const getLowStockRequests = async () => {
  try {
    const response = await fetch(`${backendUrl}/low-stock-requests`);
    if (!response.ok) throw new Error("Failed to fetch low stock requests");
    return await response.json();
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
};

export const approveLowStockRequest = async (requestId, approvalData) => {
  try {
    const response = await fetch(`${backendUrl}/low-stock-requests/${requestId}/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(approvalData),
    });
    if (!response.ok) throw new Error("Failed to approve request");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

// ----------------------------
// SPECIFIC ITEM LOOKUP
// ----------------------------
export const getStockItem = async (itemName) => {
  try {
    const response = await fetch(`${backendUrl}/get-stock/${itemName}`);
    if (!response.ok) throw new Error("Failed to fetch stock item");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

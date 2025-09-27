import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/BillingPage.css";

export default function BillingPage({ operator }) {
  const [stock, setStock] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [bill, setBill] = useState(null);
const storedOperator = JSON.parse(localStorage.getItem("operator"));

  // ✅ Fetch stock filtered by operator.department
  
    

    useEffect(() => {
  if (!storedOperator) return;

  axios
    .get("http://localhost:5000/stock", {
      params: { department: storedOperator.department }   // ✅ filter by department
    })
    .then(res => setStock(res.data.data))
    .catch(err => console.error(err));
}, [storedOperator]);


  // Add to cart
  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c =>
        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Update qty
  const updateQuantity = (id, qty) => {
    setCart(cart.map(c => (c.id === id ? { ...c, quantity: qty } : c)));
  };

  const total = cart.reduce((sum, i) => sum + i.quantity * (i.price || 100), 0);

  const generateBill = async () => {
    try {
      const res = await axios.post("http://localhost:5000/billing", {
        customer_name: customer.name,
        customer_phone: customer.phone,
        created_by: operator.username,
        user_role: operator.role,
        user_department: operator.department,
        items: cart.map(c => ({
          stock_id: c.id,
          quantity: c.quantity,
          price: c.price || 100
        }))
      });
      setBill(res.data);
      setCart([]);
    } catch (err) {
      alert("Billing failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="billing-container">
      <h2>Billing Page ({operator.department} Dept)</h2>

      <div className="customer-info">
        <input
          type="text"
          placeholder="Customer Name"
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phone"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        />
      </div>

      <h3>Products</h3>
      <div className="stock-list">
        {stock.map((item) => (
          <div key={item.id} className="stock-item">
            <span>{item.item_name} ({item.quantity})</span>
            <button onClick={() => addToCart(item)}>Add</button>
          </div>
        ))}
      </div>

      <h3>Cart</h3>
      <div className="cart-list">
        {cart.map((c) => (
          <div key={c.id} className="cart-item">
            <span>{c.item_name}</span>
            <input
              type="number"
              value={c.quantity}
              min="1"
              onChange={(e) => updateQuantity(c.id, parseInt(e.target.value))}
            />
            <span>₹{(c.price || 100) * c.quantity}</span>
          </div>
        ))}
      </div>

      <h3>Total: ₹{total}</h3>
      <button onClick={generateBill} disabled={cart.length === 0}>
        Generate Bill
      </button>

      {bill && (
        <div className="bill-summary">
          <h3>✅ Bill Generated</h3>
          <p>Bill ID: {bill.bill_id}</p>
          <p>Total: ₹{bill.total}</p>
        </div>
      )}
    </div>
  );
}

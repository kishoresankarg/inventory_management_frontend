import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('operator');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password
      });

      if (response.data.success) {
        const loggedInUser = response.data.operator;

        if (loggedInUser.role !== role) {
          setError(`Invalid credentials for ${role} role.`);
          return;
        }

        onLogin(loggedInUser);

        switch (loggedInUser.role) {
          case 'operator':
            navigate('/operator-dashboard');
            break;
          case 'supervisor':
            navigate('/supervisor-dashboard');
            break;
          case 'admin':
            navigate('/admin-dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Invalid username or password');
      } else {
        setError(error.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#e74c3c';
      case 'supervisor': return '#f39c12';
      case 'operator': return '#27ae60';
      default: return '#3498db';
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <Link to="/" className="back-home">← Back to Home</Link>

        <h2>🏭 Shakthi Stockpoint</h2>
        <h3 style={{ color: getRoleColor(role) }}>
          {role.charAt(0).toUpperCase() + role.slice(1)} Login
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: getRoleColor(role) }}
          >
            {loading ? 'Logging in...' : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        {/* Role Switch Section */}
        <div className="role-switch" style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#666' }}>Login as different role:</p>
          <div className="role-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Link
              to="/login?role=admin"
              className={`role-btn ${role === 'admin' ? 'active' : ''}`}
              style={{
                backgroundColor: '#e74c3c15',
                border: '1px solid #e74c3c',
                color: '#e74c3c',
                padding: '5px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Admin
            </Link>
            <Link
              to="/login?role=supervisor"
              className={`role-btn ${role === 'supervisor' ? 'active' : ''}`}
              style={{
                backgroundColor: '#f39c1215',
                border: '1px solid #f39c12',
                color: '#f39c12',
                padding: '5px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Supervisor
            </Link>
            <Link
              to="/login?role=operator"
              className={`role-btn ${role === 'operator' ? 'active' : ''}`}
              style={{
                backgroundColor: '#27ae6015',
                border: '1px solid #27ae60',
                color: '#27ae60',
                padding: '5px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Operator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

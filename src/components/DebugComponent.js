import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../constants';

const DebugComponent = () => {
  const [backendStatus, setBackendStatus] = useState('Testing...');
  const [envVar, setEnvVar] = useState('');

  useEffect(() => {
    // Check environment variable
    setEnvVar(process.env.REACT_APP_BACKEND_URL || 'Not set');
    
    // Test backend connection
    const testBackend = async () => {
      try {
        console.log('Testing backend URL:', BACKEND_URL);
        const response = await fetch(`${BACKEND_URL}/stock`);
        if (response.ok) {
          setBackendStatus('✅ Backend connected successfully');
        } else {
          setBackendStatus(`❌ Backend error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        setBackendStatus(`❌ Connection failed: ${error.message}`);
      }
    };

    testBackend();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      padding: '20px', 
      background: 'white', 
      border: '2px solid #333',
      borderRadius: '8px',
      zIndex: 9999,
      maxWidth: '400px'
    }}>
      <h3>Debug Info</h3>
      <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
      <p><strong>Backend URL (env):</strong> {envVar}</p>
      <p><strong>Backend URL (constant):</strong> {BACKEND_URL}</p>
      <p><strong>Backend Status:</strong> {backendStatus}</p>
    </div>
  );
};

export default DebugComponent;
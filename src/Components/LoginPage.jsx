import React, { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
  const response = await fetch(import.meta.env.VITE_LOGIN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        if (onLogin) onLogin();
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 16px #0001', minWidth: 320 }}>
        <h2 style={{ marginBottom: 24 }}>Login</h2>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="login-username" style={{ display: 'block', marginBottom: 4 }}>Username</label>
          <input
            id="login-username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', padding: 8, fontSize: 16 }}
            autoFocus
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="login-password" style={{ display: 'block', marginBottom: 4 }}>Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8, fontSize: 16 }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: 10, fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>Login</button>
      </form>
    </div>
  );
}
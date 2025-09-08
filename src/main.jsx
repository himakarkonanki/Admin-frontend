import LandingPage from './Components/LandingPage.jsx';

import React, { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import LoginPage from './Components/LoginPage.jsx';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  };
  return isAuthenticated ? <LandingPage onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

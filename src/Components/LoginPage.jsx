import React, { useState } from 'react';
import landingImage from '../assets/png/landing-image.png'; // Adjust the path as necessary
import companyLogo from '../assets/icons/companyLogo.svg'; // Adjust the path as necessary

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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${landingImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '50px 100px 100px 100px',
      }}
    >
      <div style={{
        display: 'flex',
        width: '500px',
        padding: '64px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
        flexShrink: 0,
        borderRadius: 24,
        border: '1px solid rgba(255, 255, 255, 0.12)',
        background: 'rgba(0, 0, 0, 0.24)',
        backdropFilter: 'blur(12px)',
        flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex',
          width: 380,
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 20,
          flexShrink: 0,
          borderRadius: 12
        }}>
          <img src={companyLogo} alt="Company Logo" style={{ width: '300.385px', height: '64px', aspectRatio: '133/26' }} />

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            alignSelf: 'stretch'
          }}>
            <div style={{
              alignSelf: 'stretch',
              color: '#FFF',
              fontFamily: 'Lato',
              fontSize: 20,
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: '30px'
            }}>Login to your account</div>
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 18,
                alignSelf: 'stretch'
              }}
            >

              <label htmlFor="login-username" style={{
                alignSelf: 'stretch',
                color: '#FFF',
                fontFamily: 'Lato',
                fontSize: 20,
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '20px'
              }}>Username</label>
              <input
                id="login-username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{
                  display: 'flex',
                  height: '52px',
                  fontFamily: 'Lato',
                  fontSize: 18,
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '20px',
                  padding: '8px 24px',
                  alignItems: 'center',
                  gap: '10px',
                  alignSelf: 'stretch',
                  borderRadius: '12px',
                  background: '#FFF',
                  outline: 'none',
                }}
              />


              <label htmlFor="login-password" style={{
                alignSelf: 'stretch',
                color: '#FFF',
                fontFamily: 'Lato',
                fontSize: 20,
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '20px'
              }}>Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  display: 'flex',
                  height: '52px',
                  padding: '8px 24px',
                  fontFamily: 'Lato',
                  fontSize: 18,
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '20px',
                  alignItems: 'center',
                  gap: '10px',
                  alignSelf: 'stretch',
                  borderRadius: '12px',
                  background: '#FFF',
                  outline: 'none',
                }}
              />

              <div
                style={{
                  color: error ? 'white' : 'transparent',
                  marginBottom: 16,
                  height: '10px',
                  // minHeight: '20px',
                  transition: 'color 0.2s',
                  alignSelf: 'stretch',
                  fontSize: 20,
                  fontFamily: 'Lato',
                  fontWeight: 600,
                  lineHeight: '20px',
                  textAlign: 'center',
                }}
              >
                {error || ''}
              </div>
              <button type="submit" style={{
                display: 'flex',
                height: '54px',
                padding: '12px 20px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '20px',
                alignSelf: 'stretch',
                borderRadius: '24px',
                background: '#F33F3F',
              }}><div style={{
                color: 'var(--White, #FFF)',
                textAlign: 'center',
                fontFamily: 'Lato',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: '20px' /* 125% */
              }}>

                  Login
                </div></button>
            </form>
          </div>
        </div>

      </div >

    </div >
  );
}
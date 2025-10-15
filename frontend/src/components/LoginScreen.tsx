import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToken } from '../context/TokenContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setToken } = useToken();

  const handleLogin = async () => {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error('Login failed:', error.message || 'Unknown error');
      return;
    }

    const data = await res.json();
    console.log('Received token:', data.access_token);

    const isValidJwt = data.access_token && data.access_token.split('.').length === 3;
    if (isValidJwt) {
      localStorage.setItem('access_token', data.access_token);
      setToken(data.access_token);
      navigate('/dashboard');
    } else {
      console.error('Invalid token format:', data.access_token);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9f9f9',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        fontFamily: 'inherit'
      }}>
        <h2 style={{
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 600,
          fontFamily: 'inherit'
        }}>
          Sign In
        </h2>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '1rem',
            padding: '0.75rem',
            borderRadius: '12px',
            border: '1px solid #ccc',
            outline: 'none',
            fontSize: '1rem',
            fontFamily: 'inherit'
          }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '1.5rem',
            padding: '0.75rem',
            borderRadius: '12px',
            border: '1px solid #ccc',
            outline: 'none',
            fontSize: '1rem',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#007aff',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}
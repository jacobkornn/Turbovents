import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateAccount() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    const res = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || 'Account creation failed');
      return;
    }

    navigate('/');
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: '2rem',
        boxSizing: 'border-box',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          fontFamily: 'inherit',
        }}
      >
        <h2
          style={{
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 600,
            fontFamily: 'inherit',
          }}
        >
          Create Account
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
            fontFamily: 'inherit',
          }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '1rem',
            padding: '0.75rem',
            borderRadius: '12px',
            border: '1px solid #ccc',
            outline: 'none',
            fontSize: '1rem',
            fontFamily: 'inherit',
          }}
        />
        <input
          placeholder="Confirm Password"
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '1.5rem',
            padding: '0.75rem',
            borderRadius: '12px',
            border: '1px solid #ccc',
            outline: 'none',
            fontSize: '1rem',
            fontFamily: 'inherit',
          }}
        />

        {error && (
          <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleCreate}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#007aff',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
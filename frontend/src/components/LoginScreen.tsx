import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginScreenProps {
  setToken: (token: string) => void;
}

export default function LoginScreen({ setToken }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setLocalToken] = useState('');
  const [profile, setProfile] = useState<{ username: string; role: string } | null>(null);
  const [users, setUsers] = useState<{ id: number; username: string; role: string }[]>([]);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.access_token) {
      setToken(data.access_token);       // Lift to App
      setLocalToken(data.access_token);  // Store locally
      setProfile(null);
      setUsers([]);
      navigate('/dashboard');
    }
  };

  const handleProfile = async () => {
    const res = await fetch('http://localhost:3000/api/auth/profile', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setProfile({ username: data.username, role: data.role });
  };

  const handleLoadUsers = async () => {
    const res = await fetch('http://localhost:3000/api/users', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setUsers(data);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f7',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.5rem' }}>Sign In</h2>
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
            fontSize: '1rem'
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
            fontSize: '1rem'
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
            cursor: 'pointer'
          }}
        >
          Login
        </button>

        {token && (
          <>
            <div style={{ marginTop: '1.5rem' }}>
              <strong>Token:</strong>
              <pre style={{
                backgroundColor: '#f0f0f0',
                padding: '0.5rem',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}>{token}</pre>
            </div>
            <button
              onClick={handleProfile}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#34c759',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Check Profile
            </button>
          </>
        )}

        {profile && (
          <div style={{ marginTop: '1.5rem' }}>
            <strong>Logged in as:</strong> {profile.username}<br />
            <strong>Role:</strong> {profile.role}<br />
            {profile.role === 'admin' && (
              <div style={{ marginTop: '1rem', color: 'green' }}>
                ✅ You have admin privileges.
                <br />
                <button
                  onClick={handleLoadUsers}
                  style={{
                    marginTop: '0.5rem',
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#5856d6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  Load All Users
                </button>
              </div>
            )}
          </div>
        )}

        {users.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>User List</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Username</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ padding: '0.5rem' }}>{u.id}</td>
                    <td style={{ padding: '0.5rem' }}>{u.username}</td>
                    <td style={{ padding: '0.5rem' }}>{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
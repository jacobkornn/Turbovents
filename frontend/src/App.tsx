import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';

function App() {
  const [, setToken] = useState('');

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f9f9f9',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Routes>
        <Route path="/" element={<LoginScreen setToken={setToken} />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
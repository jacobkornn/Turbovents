import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';

function App() {
  const [, setToken] = useState('');

  return (
    <Routes>
      <Route path="/" element={<LoginScreen setToken={setToken} />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
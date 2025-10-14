import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <MemoryRouter>
    <App />
  </MemoryRouter>
);
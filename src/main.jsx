import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// 1. IMPORTAR O HELMET PROVIDER
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. ENVOLVER A APLICAÇÃO */}
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)
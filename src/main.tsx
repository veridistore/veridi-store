import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Eliminamos cualquier importación de CSS externo para evitar errores
// import './index.css' 

// Buscamos el elemento 'root' que creamos en el HTML
const rootElement = document.getElementById('root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} else {
  console.error("No se encontró el elemento con id 'root' en el HTML")
}
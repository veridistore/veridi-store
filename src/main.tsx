import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css'; // Si tienes un archivo css, sino borra esta línea

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
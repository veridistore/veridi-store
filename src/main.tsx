import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// LA LÍNEA DE CSS FUE ELIMINADA PORQUE CAUSABA EL ERROR

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
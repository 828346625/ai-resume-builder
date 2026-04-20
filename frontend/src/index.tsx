import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'  // 导入 CSS
import App from './App.tsx';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
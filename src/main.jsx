// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom'; // ✅ ICI seulement
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import store from './store/store.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>  {/* ✅ Une seule fois ici */}
        <Toaster position="top-right" />
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
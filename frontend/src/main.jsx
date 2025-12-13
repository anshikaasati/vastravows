import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              // Default options
              duration: 4000,
              style: {
                background: '#fff',
                color: '#800000',
                border: '1px solid #800000',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(128, 0, 0, 0.15)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
              },
              // Success toast
              success: {
                iconTheme: {
                  primary: '#800000',
                  secondary: '#fff',
                },
                style: {
                  background: '#fff',
                  color: '#800000',
                  border: '1px solid #800000',
                },
              },
              // Error toast
              error: {
                iconTheme: {
                  primary: '#800000',
                  secondary: '#fff',
                },
                style: {
                  background: '#fff',
                  color: '#800000',
                  border: '1px solid #800000',
                },
              },
            }}
          />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  </React.StrictMode>
);



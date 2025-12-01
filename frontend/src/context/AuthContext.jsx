import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('rental_token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('rental_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('rental_token', token);
    } else {
      localStorage.removeItem('rental_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('rental_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rental_user');
    }
  }, [user]);

  const login = ({ token: newToken, user: userData }) => {
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading, setLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);



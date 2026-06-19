import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => sessionStorage.getItem('hemocore_user') || null);
  const [logged, setLogged] = useState(() => sessionStorage.getItem('hemocore_logged') === '1');

  const login = (email) => {
    sessionStorage.setItem('hemocore_user', email);
    sessionStorage.setItem('hemocore_logged', '1');
    setUser(email);
    setLogged(true);
  };

  const logout = () => {
    sessionStorage.removeItem('hemocore_user');
    sessionStorage.removeItem('hemocore_logged');
    setUser(null);
    setLogged(false);
  };

  return (
    <AuthContext.Provider value={{ user, logged, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

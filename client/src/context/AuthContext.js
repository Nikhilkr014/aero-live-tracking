import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('aeroToken');
    if (token) {
      authAPI.getMe()
        .then(res => setUser(res.data.user))
        .catch(() => localStorage.removeItem('aeroToken'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('aeroToken', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    localStorage.setItem('aeroToken', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const googleLogin = async (tokenId) => {
    const res = await authAPI.googleLogin(tokenId);
    localStorage.setItem('aeroToken', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const updateProfile = async (data) => {
    const res = await authAPI.updateProfile(data);
    setUser(prev => ({ ...prev, ...res.data.user }));
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('aeroToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, updateProfile, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

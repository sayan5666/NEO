import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => localStorage.getItem('neo_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res?.data?.user) {
            setUser(res.data.user);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchUser();
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      if (res?.data?.user) {
        setUser(res.data.user);
        setToken(res.data.token || 'neo_auth_token');
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data) => {
    setLoading(true);
    try {
      const res = await authService.signup(data);
      if (res?.data?.user) {
        setUser(res.data.user);
        setToken(res.data.token || 'neo_auth_token');
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credential) => {
    setLoading(true);
    try {
      const res = await authService.googleLogin(credential);
      if (res?.data?.user) {
        setUser(res.data.user);
        setToken(res.data.token || 'neo_auth_token');
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser({ name: 'CYBER_PUNK_01', tier: 'PREMIUM_TIER' });
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, signup, googleLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

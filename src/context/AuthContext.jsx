import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('flicktap_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('flicktap_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('flicktap_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('flicktap_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('Session verification failed, logging out:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (emailOrPhone, password) => {
    const cleanId = (emailOrPhone || '').trim();
    const res = await authApi.login({
      email: cleanId,
      phoneNumber: cleanId,
      username: cleanId,
      identifier: cleanId,
      password,
    });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('flicktap_token', newToken);
    localStorage.setItem('flicktap_user', JSON.stringify(newUser));
    return newUser;
  };

  const signup = async (data) => {
    const res = await authApi.signup(data);
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('flicktap_token', newToken);
    localStorage.setItem('flicktap_user', JSON.stringify(newUser));
    return newUser;
  };

  const sendSignupOtp = async (data) => {
    const res = await authApi.sendSignupOtp(data);
    return res.data;
  };

  const verifySignupOtp = async (emailOrData, otp) => {
    const payload = typeof emailOrData === 'object'
      ? emailOrData
      : { email: emailOrData, otp };
    const res = await authApi.verifySignupOtp(payload);
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('flicktap_token', newToken);
    localStorage.setItem('flicktap_user', JSON.stringify(newUser));
    return newUser;
  };

  const updateProfile = async (data) => {
    const res = await authApi.updateProfile(data);
    const updatedUser = res.data.user;
    setUser(updatedUser);
    localStorage.setItem('flicktap_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const deleteAccount = async () => {
    await authApi.deleteAccount({
      username: user?.username,
      email: user?.email,
      userId: user?._id || user?.id,
    });
    logout();
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem('flicktap_token');
    localStorage.removeItem('flicktap_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role?.toLowerCase() === 'admin',
        login,
        signup,
        sendSignupOtp,
        verifySignupOtp,
        updateProfile,
        deleteAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

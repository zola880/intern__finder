// hooks/useProfile.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get('/profile')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const updateProfile = async (updates) => {
    const { data } = await api.put('/profile', updates);
    setUser(data);
  };

  const setAuth = (userData) => setUser(userData);

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <ProfileContext.Provider value={{ user, updateProfile, setAuth, logout, loading }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
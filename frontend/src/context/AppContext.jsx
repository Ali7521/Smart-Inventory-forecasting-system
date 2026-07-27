import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [alertsCount, setAlertsCount] = useState({ lowStock: 0, reorderSoon: 0 });
  const [settings, setSettings] = useState(null);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAlertSummary();
      fetchSettings();
    }
  }, [user]);

  const fetchAlertSummary = async () => {
    try {
      const res = await api.get('/alerts');
      if (res.data && res.data.summary) {
        setAlertsCount({
          lowStock: res.data.summary.lowStock || 0,
          reorderSoon: res.data.summary.reorderSoon || 0
        });
      }
    } catch (err) {
      console.error('Error fetching alerts count:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const seedDatabase = async () => {
    const res = await api.post('/seed');
    await fetchAlertSummary();
    return res.data;
  };

  return (
    <AppContext.Provider
      value={{
        alertsCount,
        settings,
        fetchAlertSummary,
        fetchSettings,
        seedDatabase,
        isHowItWorksOpen,
        setIsHowItWorksOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

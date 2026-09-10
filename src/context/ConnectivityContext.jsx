import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ConnectivityContext = createContext();

export const ConnectivityProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const checkConnection = async () => {
    setIsReconnecting(true);
    try {
      // Fast DNS / Head ping
      await axios.get('https://www.google.com/favicon.ico', { timeout: 2000 });
      handleStatusChange(true);
      return true;
    } catch (_) {
      try {
        await axios.get('https://flicktap-backend.mohanashish708090.workers.dev/api/health', { timeout: 2000 });
        handleStatusChange(true);
        return true;
      } catch (err) {
        handleStatusChange(false);
        return false;
      }
    } finally {
      setIsReconnecting(false);
    }
  };

  const handleStatusChange = (online) => {
    if (online !== isOnline) {
      if (online) {
        setIsOnline(true);
        setShowRestored(true);
        setTimeout(() => setShowRestored(false), 3000);
      } else {
        setIsOnline(false);
        setShowRestored(false);
      }
    }
  };

  useEffect(() => {
    const handleOnline = () => checkConnection();
    const handleOffline = () => handleStatusChange(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic heartbeat check every 5 seconds
    const interval = setInterval(() => {
      if (!navigator.onLine) {
        handleStatusChange(false);
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  return (
    <ConnectivityContext.Provider
      value={{
        isOnline,
        showRestored,
        isReconnecting,
        checkConnection,
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = () => useContext(ConnectivityContext);

import { createContext, useState } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [cachedData, setCache] = useState({
    "profileData": null,
    lastMessageIdByChat: {},
    isUnreadByChat: {},
  });
  const updateCache = (key, data) => {
    setCache(prev => ({ ...prev, [key]: data }));
  };
  return (
    <DataContext.Provider value={{ cachedData, updateCache }}>
      {children}
    </DataContext.Provider>
  );
};
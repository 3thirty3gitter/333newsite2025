
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

interface HistoryContextType {
  viewingHistory: string[];
  addToHistory: (productId: string) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [viewingHistory, setViewingHistory] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('viewingHistory');
      if (storedHistory) {
        setViewingHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Could not load viewing history from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('viewingHistory', JSON.stringify(viewingHistory));
      } catch (error) {
        console.error("Could not save viewing history to localStorage", error);
      }
    }
  }, [viewingHistory, isLoaded]);

  const addToHistory = useCallback((productId: string) => {
    setViewingHistory((prevHistory) => {
      const updatedHistory = [productId, ...prevHistory.filter(id => id !== productId)];
      // Keep history to a reasonable size
      return updatedHistory.slice(0, 20);
    });
  }, []);

  return (
    <HistoryContext.Provider value={{ viewingHistory, addToHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};

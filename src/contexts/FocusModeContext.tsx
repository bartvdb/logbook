import React, { createContext, useContext, useState, useCallback } from 'react';

interface FocusModeContextType {
  isFocusMode: boolean;
  setFocusMode: (value: boolean) => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  toggleSidebar: () => void;
}

const FocusModeContext = createContext<FocusModeContextType | undefined>(undefined);

export const FocusModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  const setSidebarCollapsed = useCallback((value: boolean) => {
    setIsSidebarCollapsed(value);
    localStorage.setItem('sidebar-collapsed', String(value));
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(!isSidebarCollapsed);
  }, [isSidebarCollapsed, setSidebarCollapsed]);

  const setFocusMode = useCallback((value: boolean) => {
    setIsFocusMode(value);
    if (value) {
      // Auto-collapse sidebar when entering focus mode
      setSidebarCollapsed(true);
    }
  }, [setSidebarCollapsed]);

  return (
    <FocusModeContext.Provider
      value={{
        isFocusMode,
        setFocusMode,
        isSidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
      }}
    >
      {children}
    </FocusModeContext.Provider>
  );
};

export const useFocusMode = (): FocusModeContextType => {
  const context = useContext(FocusModeContext);
  if (!context) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
};

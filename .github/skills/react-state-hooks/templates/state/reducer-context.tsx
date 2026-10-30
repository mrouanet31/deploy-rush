import { createContext, useContext, type ReactNode } from 'react';

type AppContextValue = { currentUserId: string | null };
const AppContext = createContext<AppContextValue | null>(null);

export function AppContextProvider({ children, value }: { children: ReactNode; value: AppContextValue }) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useAppContext must be used inside AppContextProvider');
  return value;
}

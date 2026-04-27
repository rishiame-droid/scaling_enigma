/**
 * AppContext provides a single shared notification store to the entire app.
 * All screens consume state via useAppContext() instead of creating separate
 * store instances.
 */
import React, { createContext, useContext } from 'react';
import { useNotificationStore, NotificationStoreActions } from './notificationStore';
import { AppState } from '../types';

interface AppContextValue {
  state: AppState;
  actions: NotificationStoreActions;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [state, actions] = useNotificationStore();
  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside AppContextProvider');
  }
  return ctx;
}

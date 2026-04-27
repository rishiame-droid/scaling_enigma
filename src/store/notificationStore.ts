import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { AppState, AppAction, ServiceType, FilterType, Notification } from '../types';

const INITIAL_SERVICES = [
  { type: 'github' as ServiceType, name: 'GitHub', color: '#24292f', connected: false },
  { type: 'gmail' as ServiceType, name: 'Gmail', color: '#EA4335', connected: false },
  { type: 'slack' as ServiceType, name: 'Slack', color: '#4A154B', connected: false },
];

export const initialState: AppState = {
  notifications: [],
  services: INITIAL_SERVICES,
  activeFilter: 'all',
  isLoading: false,
  lastRefreshed: null,
  errors: {},
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };

    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };

    case 'SET_FILTER':
      return { ...state, activeFilter: action.payload };

    case 'SET_SERVICE_CONNECTED':
      return {
        ...state,
        services: state.services.map((s) =>
          s.type === action.payload.service
            ? { ...s, connected: action.payload.connected }
            : s
        ),
      };

    case 'SET_ERROR':
      if (action.payload.error === undefined) {
        const { [action.payload.service]: _removed, ...rest } = state.errors;
        void _removed;
        return { ...state, errors: rest };
      }
      return {
        ...state,
        errors: { ...state.errors, [action.payload.service]: action.payload.error },
      };

    case 'SET_LAST_REFRESHED':
      return { ...state, lastRefreshed: action.payload };

    default:
      return state;
  }
}

export interface NotificationStoreActions {
  setLoading: (loading: boolean) => void;
  setNotifications: (notifications: Notification[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setFilter: (filter: FilterType) => void;
  setServiceConnected: (service: ServiceType, connected: boolean) => void;
  setError: (service: ServiceType, error: string | undefined) => void;
  setLastRefreshed: (date: Date) => void;
}

type StoreContextValue = [AppState, NotificationStoreActions];

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setNotifications = useCallback((notifications: Notification[]) => {
    dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
  }, []);

  const markRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_READ', payload: id });
  }, []);

  const markAllRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_READ' });
  }, []);

  const setFilter = useCallback((filter: FilterType) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  const setServiceConnected = useCallback(
    (service: ServiceType, connected: boolean) => {
      dispatch({ type: 'SET_SERVICE_CONNECTED', payload: { service, connected } });
    },
    []
  );

  const setError = useCallback(
    (service: ServiceType, error: string | undefined) => {
      dispatch({ type: 'SET_ERROR', payload: { service, error } });
    },
    []
  );

  const setLastRefreshed = useCallback((date: Date) => {
    dispatch({ type: 'SET_LAST_REFRESHED', payload: date });
  }, []);

  const actions: NotificationStoreActions = {
    setLoading,
    setNotifications,
    markRead,
    markAllRead,
    setFilter,
    setServiceConnected,
    setError,
    setLastRefreshed,
  };

  return (
    <StoreContext.Provider value={[state, actions]}>
      {children}
    </StoreContext.Provider>
  );
}

export function useNotificationStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useNotificationStore must be used inside StoreProvider');
  return ctx;
}

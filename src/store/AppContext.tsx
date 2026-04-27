/**
 * Re-export StoreProvider as AppContextProvider for use in App.tsx.
 * All screens should use useNotificationStore() which requires StoreProvider
 * to be mounted in the component tree (done in App.tsx via AppContextProvider).
 */
export { StoreProvider as AppContextProvider } from './notificationStore';

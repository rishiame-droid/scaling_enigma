export type ServiceType = 'github' | 'gmail' | 'slack';

export interface Notification {
  id: string;
  service: ServiceType;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface ServiceConfig {
  type: ServiceType;
  name: string;
  color: string;
  connected: boolean;
}

export interface FetchResult {
  notifications: Notification[];
  error?: string;
}

export type FilterType = ServiceType | 'all';

export interface AppState {
  notifications: Notification[];
  services: ServiceConfig[];
  activeFilter: FilterType;
  isLoading: boolean;
  lastRefreshed: Date | null;
  errors: Partial<Record<ServiceType, string>>;
}

export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'SET_FILTER'; payload: FilterType }
  | { type: 'SET_SERVICE_CONNECTED'; payload: { service: ServiceType; connected: boolean } }
  | { type: 'SET_ERROR'; payload: { service: ServiceType; error: string | undefined } }
  | { type: 'SET_LAST_REFRESHED'; payload: Date };

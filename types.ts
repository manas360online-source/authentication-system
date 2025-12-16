export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  passwordHash: string; // Simulated hash
  mfaEnabled: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  event: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'SIGNUP' | 'PASSWORD_RESET' | 'MFA_TOGGLE' | 'ACCOUNT_LOCKED';
  status: 'success' | 'failure' | 'warning';
  ip: string;
  timestamp: string;
  details?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
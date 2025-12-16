import { User, AuditLog, Session, ApiResponse } from '../types';

// Constants for simulation
const STORAGE_USERS_KEY = 'sg_users';
const STORAGE_LOGS_KEY = 'sg_audit_logs';
const STORAGE_SESSIONS_KEY = 'sg_sessions';
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get IP (mock)
const getMockIp = () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1`;

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

// In-memory rate limiting (simulating Redis/Memcached)
const loginAttempts: Record<string, LoginAttempt> = {};

class MockBackendService {
  private getUsers(): User[] {
    const stored = localStorage.getItem(STORAGE_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveUser(user: User) {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }

  private logEvent(userId: string, event: AuditLog['event'], status: AuditLog['status'], details?: string) {
    const logs: AuditLog[] = JSON.parse(localStorage.getItem(STORAGE_LOGS_KEY) || '[]');
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      event,
      status,
      ip: getMockIp(),
      timestamp: new Date().toISOString(),
      details
    };
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify([newLog, ...logs]));
    return newLog;
  }

  // --- Public Methods ---

  async register(email: string, password: string, fullName: string, phone?: string): Promise<ApiResponse<User>> {
    await delay(800);
    const users = this.getUsers();
    
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already exists' };
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      fullName,
      phone,
      passwordHash: btoa(password), // Simple encoding for demo purposes
      mfaEnabled: false,
      isVerified: false,
      createdAt: new Date().toISOString()
    };

    this.saveUser(newUser);
    this.logEvent(newUser.id, 'SIGNUP', 'success', 'User registered');
    
    // Simulate sending OTP
    console.log(`[Backend] OTP sent to ${email}: 123456`);
    
    return { success: true, data: newUser, message: 'Registration successful. Please verify your email.' };
  }

  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string; requireMfa?: boolean }>> {
    await delay(800);

    // Rate Limiting Logic
    const now = Date.now();
    const attempt = loginAttempts[email] || { count: 0, firstAttempt: now };

    if (attempt.lockedUntil && now < attempt.lockedUntil) {
       const timeLeft = Math.ceil((attempt.lockedUntil - now) / 60000);
       return { success: false, message: `Account locked. Try again in ${timeLeft} minutes.` };
    }

    if (now - attempt.firstAttempt > RATE_LIMIT_WINDOW) {
      // Reset window
      attempt.count = 0;
      attempt.firstAttempt = now;
      attempt.lockedUntil = undefined;
    }

    const users = this.getUsers();
    const user = users.find(u => u.email === email);

    if (!user || user.passwordHash !== btoa(password)) {
      attempt.count++;
      if (attempt.count >= MAX_ATTEMPTS) {
        attempt.lockedUntil = now + RATE_LIMIT_WINDOW;
        if (user) this.logEvent(user.id, 'ACCOUNT_LOCKED', 'warning', 'Too many failed attempts');
      }
      loginAttempts[email] = attempt;
      
      if (user) this.logEvent(user.id, 'LOGIN_FAILED', 'failure', 'Invalid credentials');
      
      return { success: false, message: 'Invalid email or password' };
    }

    // Success - Reset rate limit
    delete loginAttempts[email];

    if (user.mfaEnabled) {
      // Simulate sending 2FA code
      console.log(`[Backend] MFA Code sent to ${user.phone || user.email}: 999999`);
      return { success: true, data: { user, token: '', requireMfa: true }, message: 'MFA Required' };
    }

    const token = `jwt_mock_${Math.random().toString(36).substr(2)}${Math.random().toString(36).substr(2)}`;
    this.logEvent(user.id, 'LOGIN_SUCCESS', 'success', 'Login via Password');
    
    return { success: true, data: { user, token }, message: 'Login successful' };
  }

  async verifyOtp(email: string, code: string): Promise<ApiResponse<boolean>> {
    await delay(600);
    // Hardcoded mock OTP for demo
    if (code === '123456' || code === '999999') {
      const users = this.getUsers();
      const user = users.find(u => u.email === email);
      if (user) {
         user.isVerified = true;
         this.saveUser(user);
         this.logEvent(user.id, 'LOGIN_SUCCESS', 'success', 'OTP Verified');
      }
      return { success: true, data: true };
    }
    return { success: false, message: 'Invalid OTP code' };
  }

  async googleLogin(): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay(1200);
    // Simulate a user coming from Google
    const email = 'demo.user@gmail.com';
    let users = this.getUsers();
    let user = users.find(u => u.email === email);

    if (!user) {
      user = {
        id: 'google_user_123',
        email,
        fullName: 'Demo Google User',
        passwordHash: '',
        mfaEnabled: false,
        isVerified: true,
        createdAt: new Date().toISOString()
      };
      this.saveUser(user);
      this.logEvent(user.id, 'SIGNUP', 'success', 'Registered via Google OAuth');
    }

    this.logEvent(user.id, 'LOGIN_SUCCESS', 'success', 'Login via Google OAuth');
    const token = `jwt_mock_google_${Date.now()}`;
    return { success: true, data: { user, token } };
  }

  async getAuditLogs(userId: string): Promise<AuditLog[]> {
    await delay(400);
    const logs: AuditLog[] = JSON.parse(localStorage.getItem(STORAGE_LOGS_KEY) || '[]');
    return logs.filter(l => l.userId === userId);
  }

  async getSessions(userId: string): Promise<Session[]> {
    await delay(400);
    return [
      {
        id: 'sess_1',
        userId,
        device: 'Chrome / Windows 11',
        ip: getMockIp(),
        location: 'New York, US',
        lastActive: 'Just now',
        isCurrent: true
      },
      {
        id: 'sess_2',
        userId,
        device: 'Safari / iPhone 13',
        ip: getMockIp(),
        location: 'New Jersey, US',
        lastActive: '2 days ago',
        isCurrent: false
      }
    ];
  }

  async toggleMfa(userId: string, enabled: boolean): Promise<boolean> {
    await delay(500);
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.mfaEnabled = enabled;
      this.saveUser(user);
      this.logEvent(user.id, 'MFA_TOGGLE', 'warning', `MFA ${enabled ? 'Enabled' : 'Disabled'}`);
      return true;
    }
    return false;
  }
}

export const authService = new MockBackendService();
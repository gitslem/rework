import { create } from 'zustand';
import { authAPI, usersAPI } from './api';

interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  googleAuth: (token: string, role?: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      console.log('[AuthStore] Starting login for:', email);
      const response = await authAPI.login({ email, password });
      const { access_token, refresh_token } = response.data;
      console.log('[AuthStore] Login successful, got tokens');

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Fetch user data
      console.log('[AuthStore] Fetching user data from /users/me');
      const userResponse = await usersAPI.getMe();
      console.log('[AuthStore] User data fetched:', userResponse.data);

      set({
        user: userResponse.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('[AuthStore] Login failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, role: string) => {
    try {
      console.log('[AuthStore] Starting registration for:', email, 'with role:', role);
      const registerResponse = await authAPI.register({ email, password, role });
      console.log('[AuthStore] Registration successful:', registerResponse.data);

      // After registration, log the user in
      console.log('[AuthStore] Attempting auto-login after registration');
      await useAuthStore.getState().login(email, password);
      console.log('[AuthStore] Auto-login successful');
    } catch (error: any) {
      console.error('[AuthStore] Registration failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      throw error;
    }
  },

  googleAuth: async (token: string, role?: string) => {
    try {
      console.log('[AuthStore] Starting Google authentication');
      const response = await authAPI.googleAuth({ token, role });
      const { access_token, refresh_token } = response.data;
      console.log('[AuthStore] Google auth successful, got tokens');

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Fetch user data
      console.log('[AuthStore] Fetching user data from /users/me');
      const userResponse = await usersAPI.getMe();
      console.log('[AuthStore] User data fetched:', userResponse.data);

      set({
        user: userResponse.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('[AuthStore] Google auth failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  fetchUser: async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const response = await usersAPI.getMe();
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

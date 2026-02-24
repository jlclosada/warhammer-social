import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setLoading: (loading) => set({ isLoading: loading }),
      clearError: () => set({ error: null }),
      setUser: (user) => set({ user }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login/', { email, password });
          const { access, refresh, user } = response.data;

          set({
            user,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const message =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            'Invalid credentials. Please try again.';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register/', data);
          const { tokens, user } = response.data;

          set({
            user,
            accessToken: tokens.access,
            refreshToken: tokens.refresh,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errors = error.response?.data;
          let message = 'Registration failed. Please try again.';

          if (errors) {
            const firstKey = Object.keys(errors)[0];
            const firstError = errors[firstKey];
            message = Array.isArray(firstError) ? firstError[0] : String(firstError);
          }

          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          if (refreshToken) {
            await api.post('/auth/logout/', { refresh: refreshToken });
          }
        } catch {
          // Ignore logout errors
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const response = await api.post('/auth/login/refresh/', {
            refresh: refreshToken,
          });

          set({
            accessToken: response.data.access,
            refreshToken: response.data.refresh || refreshToken,
          });

          return true;
        } catch {
          get().logout();
          return false;
        }
      },

      fetchUser: async () => {
        try {
          const response = await api.get('/auth/me/');
          set({ user: response.data });
        } catch {
          // Silent fail
        }
      },
    }),
    {
      name: 'wh-portal-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);


import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Component } from 'react';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppLayout from './components/AppLayout';
import FeedPage from './pages/FeedPage';
import Dashboard from './pages/Dashboard';
import CollectionsPage from './pages/CollectionsPage';
import NewCollectionPage from './pages/NewCollectionPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import CatalogPage from './pages/CatalogPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AchievementsPage from './pages/AchievementsPage';

/* ── Error Boundary ── */
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface p-6">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-semibold text-text-primary mb-2">Something went wrong</h1>
            <p className="text-sm text-text-secondary mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => { localStorage.clear(); window.location.href = '/'; }}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-accent-hover"
            >
              Clear data &amp; restart
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/feed" replace />;
  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1C1C28',
            color: '#F0F0F5',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px',
            fontSize: '13px',
            fontFamily: "'Inter Variable', sans-serif",
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          },
          success: {
            iconTheme: { primary: '#6C5CE7', secondary: '#F0F0F5' },
          },
          error: {
            iconTheme: { primary: '#FF4757', secondary: '#F0F0F5' },
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected routes with sidebar layout */}
        <Route element={<AppLayout />}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/new" element={<NewCollectionPage />} />
          <Route path="/collections/:id" element={<CollectionDetailPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}


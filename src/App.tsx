import { useEffect, useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RouterProvider, useRouter } from './contexts/RouterContext';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import ConfigScreen from './components/ConfigScreen';
import LandingPage from './components/LandingPage';
import ApiKeyManager from './components/ApiKeyManager';
import Documentation from './components/Documentation';
import { isSupabaseConfigured } from './lib/supabase';

const AppContent = () => {
  const { user, loading } = useAuth();
  const { currentRoute, intendedRoute, setIntendedRoute, navigateTo } = useRouter();
  const [redirectRoute, setRedirectRoute] = useState<string | null>(null);

  // Handle intended route after authentication
  useEffect(() => {
    console.log('🔍 App.tsx - Auth state changed:', { user: !!user, intendedRoute, redirectRoute });
    if (user && intendedRoute && !redirectRoute) {
      console.log('✅ User authenticated with intended route:', intendedRoute);
      setRedirectRoute(intendedRoute);
      setIntendedRoute(null); // Clear immediately
      // Navigate to the intended route
      navigateTo(intendedRoute as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, intendedRoute]);

  // Redirect authenticated users away from login/signup pages
  useEffect(() => {
    if (user && (currentRoute === 'login' || currentRoute === 'signup')) {
      // Check if user came from signup flow (intended route not set)
      // If coming from login/signup without intended route, go to API keys (extension flow)
      if (!intendedRoute) {
        console.log('🔄 User authenticated from login/signup, redirecting to API keys (extension flow)');
        navigateTo('api-keys');
      } else {
        console.log('🔄 User authenticated, redirecting to intended route or dashboard');
        navigateTo(intendedRoute || 'dashboard');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentRoute, intendedRoute]);

  // Redirect unauthenticated users away from protected pages
  useEffect(() => {
    if (!user && !loading && (currentRoute === 'dashboard' || currentRoute === 'api-keys')) {
      console.log('🔄 User not authenticated, redirecting from protected page to landing');
      navigateTo('landing');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, currentRoute]);

  console.log('🔍 App.tsx render:', { user: !!user, loading, currentRoute, intendedRoute, redirectRoute });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
        <p className="text-white mt-4">Loading...</p>
      </div>
    );
  }

  // If user is authenticated
  if (user) {
    // Handle routing for authenticated users based on current route
    switch (currentRoute) {
      case 'api-keys':
        console.log('🎯 Rendering ApiKeyManager due to currentRoute');
        return <ApiKeyManager />;
      case 'landing':
        console.log('🎯 Rendering LandingPage');
        return <LandingPage />;
      case 'documentation':
        return <Documentation />;
      case 'login':
      case 'signup':
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  }

  // Handle different routes for unauthenticated users
  switch (currentRoute) {
    case 'login':
    case 'signup':
      return <AuthForm />;
    case 'api-keys':
      return <ApiKeyManager />;
    case 'documentation':
      return <Documentation />;
    case 'landing':
    default:
      return <LandingPage />;
  }
};

function App() {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return <ConfigScreen />;
  }

  return (
    <RouterProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </RouterProvider>
  );
}

export default App;

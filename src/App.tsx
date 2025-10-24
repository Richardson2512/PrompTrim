import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RouterProvider, useRouter } from './contexts/RouterContext';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import ConfigScreen from './components/ConfigScreen';
import LandingPage from './components/LandingPage';
import { isSupabaseConfigured } from './lib/supabase';

const AppContent = () => {
  const { user, loading } = useAuth();
  const { currentRoute } = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
        <p className="text-white mt-4">Loading...</p>
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (user) {
    return <Dashboard />;
  }

  // Handle different routes for unauthenticated users
  switch (currentRoute) {
    case 'login':
    case 'signup':
      return <AuthForm />;
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

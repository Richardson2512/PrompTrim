import React, { createContext, useContext, useState, useEffect } from 'react';

type Route = 'landing' | 'login' | 'signup' | 'dashboard' | 'api-keys' | 'documentation';

interface RouterContextType {
  currentRoute: Route;
  navigateTo: (route: Route) => void;
  intendedRoute: Route | null;
  setIntendedRoute: (route: Route | null) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

// Get initial route from URL
const getInitialRoute = (): Route => {
  const path = window.location.pathname.slice(1); // Remove leading /
  const validRoutes: Route[] = ['landing', 'login', 'signup', 'dashboard', 'api-keys', 'documentation'];
  return validRoutes.includes(path as Route) ? (path as Route) : 'landing';
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within RouterProvider');
  }
  return context;
};

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<Route>(getInitialRoute);
  const [intendedRoute, setIntendedRoute] = useState<Route | null>(null);

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const path = window.location.pathname.slice(1);
      const validRoutes: Route[] = ['landing', 'login', 'signup', 'dashboard', 'api-keys', 'documentation'];
      if (validRoutes.includes(path as Route)) {
        setCurrentRoute(path as Route);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: Route) => {
    console.log('🧭 Router: Navigating to', route);
    setCurrentRoute(route);
    // Update browser URL
    window.history.pushState({ route }, '', `/${route}`);
  };

  const handleSetIntendedRoute = (route: Route | null) => {
    console.log('🧭 Router: Setting intended route to', route);
    setIntendedRoute(route);
  };

  return (
    <RouterContext.Provider value={{ currentRoute, navigateTo, intendedRoute, setIntendedRoute: handleSetIntendedRoute }}>
      {children}
    </RouterContext.Provider>
  );
};

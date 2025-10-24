import React, { createContext, useContext, useState } from 'react';

type Route = 'landing' | 'login' | 'signup' | 'dashboard';

interface RouterContextType {
  currentRoute: Route;
  navigateTo: (route: Route) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within RouterProvider');
  }
  return context;
};

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<Route>('landing');

  const navigateTo = (route: Route) => {
    setCurrentRoute(route);
  };

  return (
    <RouterContext.Provider value={{ currentRoute, navigateTo }}>
      {children}
    </RouterContext.Provider>
  );
};


import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { RiderHome } from './pages/RiderHome';
import { VehicleDetails } from './pages/VehicleDetails';
import { RoleEnum } from './types';
import { ROUTES } from './constants';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: RoleEnum[] }> = ({ children, roles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    // If user has wrong role, redirect to their appropriate home
    if (user.role === RoleEnum.OWNER) return <Navigate to={ROUTES.DASHBOARD} replace />;
    if (user.role === RoleEnum.RIDER) return <Navigate to={ROUTES.SEARCH} replace />;
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

const HomeRedirect = () => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <RiderHome />; // Public home is rider search
    if (user?.role === RoleEnum.OWNER) return <Navigate to={ROUTES.DASHBOARD} replace />;
    return <Navigate to={ROUTES.SEARCH} replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <HashRouter>
          <div className="min-h-screen bg-slate-50">
            <Navbar />
            <Routes>
              <Route path={ROUTES.HOME} element={<HomeRedirect />} />
              <Route path={ROUTES.LOGIN} element={<Login />} />
              
              <Route 
                path={ROUTES.DASHBOARD} 
                element={
                  <ProtectedRoute roles={[RoleEnum.OWNER]}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path={ROUTES.SEARCH} 
                element={
                  <RiderHome />
                } 
              />
              
              <Route path="/vehicle/:id" element={<VehicleDetails />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
          </div>
        </HashRouter>
      </CurrencyProvider>
    </AuthProvider>
  );
};

export default App;

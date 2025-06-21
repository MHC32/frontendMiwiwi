import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from 'src/redux/slices/auth.slice';

interface GuestGuardProps {
  children: ReactNode;
}

export default function GuestGuard({ children }: GuestGuardProps) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    // Redirige vers la page précédente ou dashboard
    const returnTo = location.state?.from || '/dashboard/app';
    return <Navigate to={returnTo} replace />;
  }

  return <>{children}</>;
}
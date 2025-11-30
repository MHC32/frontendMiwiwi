import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCookies } from 'react-cookie';
import { selectIsAuthenticated } from 'src/redux/slices/auth.slice';

interface GuestGuardProps {
  children: ReactNode;
}

export default function GuestGuard({ children }: GuestGuardProps) {
  const [cookies] = useCookies(['jwt']);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  // Si authentifié ET cookie présent, rediriger vers dashboard
  if (isAuthenticated && cookies.jwt) {
    const returnTo = (location.state as any)?.from || '/dashboard/app';
    return <Navigate to={returnTo} replace />;
  }

  return <>{children}</>;
}
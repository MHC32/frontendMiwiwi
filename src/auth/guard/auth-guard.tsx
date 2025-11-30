import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from 'src/redux/slices/auth.slice';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  // ✅ Vérification simple basée uniquement sur Redux
  if (!isAuthenticated) {
    console.log('🚫 [AuthGuard] Accès refusé - Redirection vers login');
    return <Navigate to="/auth/jwt/login" state={{ from: location.pathname }} replace />;
  }

  console.log('✅ [AuthGuard] Accès autorisé');
  return <>{children}</>;
}
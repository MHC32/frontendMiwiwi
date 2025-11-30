import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from 'src/redux/slices/auth.slice';

interface GuestGuardProps {
  children: ReactNode;
}

export default function GuestGuard({ children }: GuestGuardProps) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  // ✅ Vérification simple basée uniquement sur Redux
  if (isAuthenticated) {
    const returnTo = (location.state as any)?.from || '/dashboard/app';
    console.log('🔄 [GuestGuard] Utilisateur déjà authentifié - Redirection vers', returnTo);
    return <Navigate to={returnTo} replace />;
  }

  console.log('✅ [GuestGuard] Accès autorisé à la page publique');
  return <>{children}</>;
}
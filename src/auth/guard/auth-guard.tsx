import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useCookies } from 'react-cookie';
import { selectIsAuthenticated, logoutSuccess } from 'src/redux/slices/auth.slice';
import type { AppDispatch } from 'src/redux/store';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [cookies] = useCookies(['jwt']);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  // Vérifier que le cookie existe si l'utilisateur est "authentifié"
  useEffect(() => {
    if (isAuthenticated && !cookies.jwt) {
      console.warn('⚠️ [AuthGuard] Utilisateur authentifié mais cookie manquant');
      dispatch(logoutSuccess());
    }
  }, [isAuthenticated, cookies.jwt, dispatch]);

  // Si pas authentifié ou pas de cookie, rediriger vers login
  if (!isAuthenticated || !cookies.jwt) {
    return <Navigate to="/auth/jwt/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
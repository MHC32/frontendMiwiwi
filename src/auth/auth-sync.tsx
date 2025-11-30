import { ReactNode, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCookies } from 'react-cookie';
import { SplashScreen } from 'src/components/loading-screen';
import { 
  initializeAuth, 
  logoutSuccess, 
  setInitialized,
  selectIsInitialized 
} from 'src/redux/slices/auth.slice';
import type { AppDispatch } from 'src/redux/store';

type Props = {
  children: ReactNode;
};

export function AuthSync({ children }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [cookies] = useCookies(['jwt']);
  const isInitialized = useSelector(selectIsInitialized);
  const [checking, setChecking] = useState(true);

  // ✅ Utiliser useCallback pour stabiliser la fonction
  const initialize = useCallback(async () => {
    console.log('🔄 [AuthSync] Vérification de l\'authentification...');
    
    try {
      // 1. Vérifier si le cookie JWT existe
      if (!cookies.jwt) {
        console.log('❌ [AuthSync] Aucun cookie JWT trouvé');
        dispatch(logoutSuccess());
        dispatch(setInitialized());
        return;
      }

      console.log('✅ [AuthSync] Cookie JWT trouvé, vérification auprès du serveur...');
      
      // 2. Vérifier la validité du token auprès du serveur
      await dispatch(initializeAuth());
      
      console.log('✅ [AuthSync] Authentification valide');
    } catch (error) {
      console.error('❌ [AuthSync] Erreur lors de la vérification:', error);
      // Si erreur 401 ou token invalide, déconnecter
      dispatch(logoutSuccess());
      dispatch(setInitialized());
    } finally {
      setChecking(false);
    }
  }, [cookies.jwt, dispatch]); // ✅ Dépendances ajoutées

  useEffect(() => {
    initialize();
  }, [initialize]); // ✅ Dépend de la fonction initialize

  // Synchroniser l'état si le cookie disparaît pendant la session
  useEffect(() => {
    if (isInitialized && !cookies.jwt) {
      console.log('⚠️ [AuthSync] Cookie JWT supprimé pendant la session');
      dispatch(logoutSuccess());
    }
  }, [cookies.jwt, isInitialized, dispatch]); // ✅ Toutes les dépendances

  // Afficher le splash screen pendant la vérification initiale
  if (checking || !isInitialized) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
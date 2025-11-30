import { ReactNode, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SplashScreen } from 'src/components/loading-screen';
import { 
  initializeAuth, 
  selectIsInitialized 
} from 'src/redux/slices/auth.slice';
import type { AppDispatch } from 'src/redux/store';

type Props = {
  children: ReactNode;
};

export function AuthSync({ children }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const isInitialized = useSelector(selectIsInitialized);
  
  // ✅ Utiliser useRef pour éviter les doubles appels
  const hasInitialized = useRef(false);

  useEffect(() => {
    // S'exécute UNE SEULE FOIS au montage de l'application
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      
      console.log('🔄 [AuthSync] Initialisation de l\'authentification...');
      dispatch(initializeAuth());
    }
  }, [dispatch]);

  // Afficher le splash screen pendant la vérification initiale
  if (!isInitialized) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
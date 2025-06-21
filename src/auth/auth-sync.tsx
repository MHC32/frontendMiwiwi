import { ReactNode } from 'react';
import { SplashScreen } from 'src/components/loading-screen';

type Props = {
  children: ReactNode;
};

export function AuthSync({ children }: Props) {
  // Juste un wrapper pour le SplashScreen
  return <>{children}</>;
}
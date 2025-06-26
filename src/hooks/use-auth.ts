import { useSelector } from 'react-redux';
import { selectAuthState } from "src/redux/slices/auth.slice";

export const useAuth = () => {
  const authState = useSelector(selectAuthState);
  
  return {
    user: authState.user,
    profile: authState.profile,
    isAuthenticated: authState.isAuthenticated,
  };
};
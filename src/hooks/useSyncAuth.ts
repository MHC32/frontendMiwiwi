import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { logoutSuccess, selectIsAuthenticated } from '../redux/slices/auth.slice';
import { useSelector,useDispatch } from 'react-redux';

export const useSyncAuth = () => {
  const [cookies] = useCookies(['jwt']);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!cookies.jwt && isAuthenticated) {
      dispatch(logoutSuccess());
    }
  }, [cookies.jwt, isAuthenticated, dispatch]);
};
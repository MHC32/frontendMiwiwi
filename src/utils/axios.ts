import axios from 'axios';
import { HOST_API } from 'src/config-global';
import { store } from 'src/redux/store';
import { logoutSuccess } from 'src/redux/slices/auth.slice';

const axiosInstance = axios.create({
  baseURL: HOST_API,
  withCredentials: true
});

// Intercepteur pour la gestion des erreurs
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Ne PAS déclencher le logout sur les routes d'authentification
    const isAuthRoute = error.config?.url?.includes('/login') || 
                        error.config?.url?.includes('/owner-data');

    // Gestion du 401 (Unauthorized)
    if (error.response?.status === 401 && !isAuthRoute) {
      console.warn('⚠️ [Axios] Session expirée - Déconnexion automatique');
      
      store.dispatch(logoutSuccess());
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/auth/jwt/login';
      
      return Promise.reject(new Error('Session expirée. Veuillez vous reconnecter.'));
    }

    const errorMessage = error.response?.data?.error ||
                        error.response?.data?.message ||
                        error.message ||
                        'Erreur inconnue';
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;

export const API_ENDPOINTS = {
  auth: {
    login: '/api/user/login',
    loginOwner: '/api/user/login-owner',
    logout: '/api/user/logout',
    ownerData: '/api/user/owner-data',
    me: '/jwtid'
  },
  products: {
    list: '/api/owner/products',
    create: '/api/owner/products',
    update: (id: string) => `/api/owner/products/${id}`,
    delete: (id: string) => `/api/owner/products/${id}`,
    deactivate: (id: string) => `/api/owner/products/${id}`,
    reactivate: (id: string) => `/api/owner/products/${id}/reactivate`,
  },
  stores: {
    list: '/api/owner/stores',
    create: '/api/owner/stores',
    update: (id: string) => `/api/owner/stores/${id}`,
    delete: (id: string) => `/api/owner/stores/${id}`,
  },
  categories: {
    list: '/api/owner/categories',
    create: '/api/owner/categories',
    update: (id: string) => `/api/owner/categories/${id}`,
    delete: (id: string) => `/api/owner/categories/${id}`,
  }
};
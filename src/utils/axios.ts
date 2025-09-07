import axios from 'axios';
import { HOST_API } from 'src/config-global';
import { store } from 'src/redux/store';

const axiosInstance = axios.create({
  baseURL: HOST_API,
  withCredentials: true
});

// Intercepteur pour la gestion des erreurs avec logout automatique sur 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion spécifique du 401 (Unauthorized)
    if (error.response?.status === 401) {
      // 1. Dispatch action de logout pour nettoyer Redux
      store.dispatch({ type: 'auth/logout' });
      
      // 2. Nettoyer le localStorage/sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // 3. Redirection vers la page de login
      window.location.href = '/login';
      
      // 4. Retourner une erreur spécifique
      return Promise.reject(new Error('Session expirée. Veuillez vous reconnecter.'));
    }

    // Gestion améliorée des autres erreurs
    const errorMessage = error.response?.data?.error ||
                        error.response?.data?.message ||
                        error.message ||
                        'Erreur inconnue';
    
    return Promise.reject(new Error(errorMessage));
  }
);

// Intercepteur pour ajouter automatiquement le token d'auth si disponible
axiosInstance.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis Redux store
    const state = store.getState();
    const token = state.auth?.accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

export const API_ENDPOINTS = {
  auth: {
    login: '/api/user/login',
    logout: '/api/user/logout',
    me: '/jwtid' // Pour checkAuth
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
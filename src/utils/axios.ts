import axios from 'axios';
import { HOST_API } from 'src/config-global';

const axiosInstance = axios.create({ 
  baseURL: HOST_API,
  withCredentials: true
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion améliorée des erreurs
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Erreur inconnue';
    
    return Promise.reject(errorMessage);
  }
);

export default axiosInstance;

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'; // Redirection globale
    }
    return Promise.reject(error);
  }
);


export const API_ENDPOINTS = {
  auth: {
    login: '/api/user/login',
    logout: '/api/user/logout',
    me: '/jwtid' // Pour checkAuth
  },
  // ... autres endpoints
};
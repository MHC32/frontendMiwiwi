import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch } from 'src/redux/store';
import { authRequests } from 'src/utils/request';

// Types
export interface User {
  id: string;
  role: string;
  phone: string;
}

// ✅ Types flexibles qui correspondent à ce que l'API retourne vraiment
export interface Company {
  id: string;
  name: string;
  description?: string;
  ref_code: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at?: string; // ✅ Optionnel maintenant
  is_active?: boolean; // ✅ Ajouté pour account-company.tsx
  settings?: {         // ✅ Ajouté pour account-company.tsx
    currency?: string;
    tax_rate?: number;
  };
}

export interface Store {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  company_id?: string; // ✅ Optionnel maintenant
  created_at?: string; // ✅ Optionnel maintenant
}

export interface Profile {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  companies?: Company[];
  stores?: Store[];
  supervisedStore?: Store | null; // ✅ Accepte null maintenant
}

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: User | null;
  profile: Profile | null;
  error: string | null;
  accessToken: string | null;
}

const initialState: AuthState = {
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  profile: null,
  error: null,
  accessToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    loginSuccess: (state, action: PayloadAction<{ user: User; profile: Profile }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.profile = action.payload.profile;
      state.error = null;
    },

    authFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.profile = null;
      state.error = action.payload;
    },

    logoutSuccess: (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.profile = null;
      state.error = null;
      state.accessToken = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    clearUser: (state) => {
      state.user = null;
      state.profile = null;
    },

    updateProfile: (state, action: PayloadAction<Partial<Profile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },

    setInitialized: (state) => {
      state.isInitialized = true;
    }
  },
});

export const {
  startLoading,
  loginSuccess,
  authFailure,
  logoutSuccess,
  clearError,
  clearUser,
  updateProfile,
  setInitialized
} = authSlice.actions;

// Thunks
export const loginOwner = (credentials: { phone: string; password: string }) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(startLoading());
      const loginResponse = await authRequests.loginOwner(credentials);
      const profileResponse = await authRequests.getOwnerData();
      
      dispatch(loginSuccess({
        user: {
          id: loginResponse.userId,
          role: loginResponse.role,
          phone: credentials.phone
        },
        profile: {
          firstName: profileResponse.user.firstName,
          lastName: profileResponse.user.lastName,
          email: profileResponse.user.email,
          phone: profileResponse.user.phone,
          companies: profileResponse.companies,
          stores: profileResponse.stores,
          supervisedStore: profileResponse.supervisedStore ?? null // ✅ Convertir undefined en null
        }
      }));
      
      dispatch(setInitialized());
      return { success: true };
    } catch (error: any) {
      dispatch(authFailure(error.message));
      throw error;
    }
  };

export const initializeAuth = () => async (dispatch: AppDispatch) => {
  try {
    console.log('🚀 [initializeAuth] Démarrage récupération profil');
    const profileResponse = await authRequests.getOwnerData();
    console.log('✅ [initializeAuth] Profil récupéré :', profileResponse);

    dispatch(loginSuccess({
      user: {
        id: profileResponse.user.id,
        role: profileResponse.user.role,
        phone: profileResponse.user.phone
      },
      profile: {
        firstName: profileResponse.user.firstName,
        lastName: profileResponse.user.lastName,
        email: profileResponse.user.email,
        phone: profileResponse.user.phone,
        companies: profileResponse.companies,
        stores: profileResponse.stores,
        supervisedStore: profileResponse.supervisedStore ?? null // ✅ Convertir undefined en null
      }
    }));
  } catch (error) {
    console.error('❌ [initializeAuth] Erreur récupération profil', error);
    dispatch(logoutSuccess());
    throw error; // Propager l'erreur pour que AuthSync puisse la gérer
  } finally {
    console.log('🏁 [initializeAuth] Fin initializeAuth');
    dispatch(setInitialized());
  }
};

export const logout = () => async (dispatch: AppDispatch) => {
  try {
    console.log('🚪 [logout] Déconnexion en cours...');
    
    // 1. Appeler l'API de logout (même si ça échoue, on continue)
    try {
      await authRequests.logout();
      console.log('✅ [logout] Logout API réussi');
    } catch (apiError: any) {
      console.warn('⚠️ [logout] Erreur API (on continue quand même):', apiError.message);
      // On ignore l'erreur "aucune session active" côté serveur
    }

    // 2. Nettoyer le cookie JWT localement
    document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    console.log('✅ [logout] Cookie supprimé');

    // 3. Nettoyer Redux
    dispatch(logoutSuccess());
    console.log('✅ [logout] Redux nettoyé');

    // 4. Nettoyer le localStorage/sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ [logout] Storage nettoyé');

    // 5. Redirection vers login (CORRECTION DU BUG)
    window.location.href = '/auth/jwt/login'; // ✅ Utiliser href au lieu de pathname
    
  } catch (error: any) {
    console.error('❌ [logout] Erreur lors du logout:', error);
    // Même en cas d'erreur, on force la redirection
    dispatch(logoutSuccess());
    window.location.href = '/auth/jwt/login';
  }
};

export default authSlice.reducer;

// Sélecteurs
export const selectAuthState = (state: { auth: AuthState }): AuthState => state.auth;
export const selectCurrentUser = (state: { auth: AuthState }): User | null => state.auth.user;
export const selectProfile = (state: { auth: AuthState }): Profile | null => state.auth.profile;
export const selectIsAuthenticated = (state: { auth: AuthState }): boolean => state.auth.isAuthenticated;
export const selectIsInitialized = (state: { auth: AuthState }): boolean => state.auth.isInitialized;
export const selectIsLoading = (state: { auth: AuthState }): boolean => state.auth.isLoading;
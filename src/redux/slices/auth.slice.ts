import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppDispatch } from 'src/redux/store';
import { authRequests } from 'src/utils/request';


// Types supplémentaires
type Company = { id: string; name: string; ref_code: string; settings: { currency: string; tax_rate: number }; is_active: boolean; };
type Store = { id: string; name: string; contact: { address: { city: string; country: string }; phone: string; }; is_active: boolean; employees?: Array<{ id: string; first_name: string; last_name: string; role: string; }>; };
type Profile = { firstName: string; lastName: string; email?: string; phone: string; companies: Company[]; stores: Store[]; supervisedStore: Store | null; };
type User = { id: string; role: string; phone?: string; };

type AuthState = {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  isInitialized: false,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  user: null,
  profile: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    startLoading: (state) => { state.isLoading = true; state.error = null; },
    loginSuccess: (state, action: PayloadAction<{ user: User; profile: Profile }>) => {
      console.log('🟢 [authSlice] loginSuccess called');
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = action.payload.user;
      state.profile = action.payload.profile;
      state.error = null;
    },
    authFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.profile = null;
      state.error = null;
    },
    clearError: (state) => { state.error = null; },
    clearUser: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.profile = null;
      state.error = null;
      state.isLoading = false;
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
          supervisedStore: profileResponse.supervisedStore
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
        supervisedStore: profileResponse.supervisedStore
      }
    }));
  } catch (error) {
    console.error('❌ [initializeAuth] Erreur récupération profil', error);
    dispatch(logoutSuccess());
  } finally {
    console.log('🏁 [initializeAuth] Fin initializeAuth, dispatch setInitialized');
    dispatch(setInitialized());
  }
};


export const logout = () => async (dispatch: AppDispatch) => {
  document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  await authRequests.logout();
  dispatch(logoutSuccess());
  window.location.pathname = '/auth/jwt/login';
};

export default authSlice.reducer;

// Sélecteurs
export const selectAuthState = (state: { auth: AuthState }): AuthState => state.auth;
export const selectCurrentUser = (state: { auth: AuthState }): User | null => state.auth.user;
export const selectProfile = (state: { auth: AuthState }): Profile | null => state.auth.profile;
export const selectIsAuthenticated = (state: { auth: AuthState }): boolean => state.auth.isAuthenticated;
export const selectIsInitialized = (state: { auth: AuthState }): boolean => state.auth.isInitialized;
export const selectIsLoading = (state: { auth: AuthState }): boolean => state.auth.isLoading;

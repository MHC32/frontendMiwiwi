// src/redux/slices/meter-reading.slice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from 'src/redux/store';
import { meterReadingRequests } from 'src/utils/request';
import type { 
  IMeterReadingItem, 
  IMeterReadingFilters,
  IVerifyReadingPayload,
  MeterReadingListResponse,
  VerifyReadingResponse,
  MeterReadingStatus,
  MeterReadingType
} from 'src/types/meter-reading';

interface MeterReadingState {
  isLoading: boolean;
  error: string | null;
  readings: IMeterReadingItem[];
  currentReading: IMeterReadingItem | null;
  storeReadings: Record<string, IMeterReadingItem[]>; // Cache par storeId
  stats: {
    total: number;
    pending: number;
    verified: number;
    rejected: number;
    byType: Record<string, number>;
  };
  filters: IMeterReadingFilters;
}

const initialState: MeterReadingState = {
  isLoading: false,
  error: null,
  readings: [],
  currentReading: null,
  storeReadings: {},
  stats: {
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    byType: {},
  },
  filters: {
    date: undefined,
    type: 'all',
    status: 'all',
  },
};

const meterReadingSlice = createSlice({
  name: 'meterReading',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Récupérer les relevés d'un magasin
    getStoreReadingsSuccess(state, action: PayloadAction<{ storeId: string; data: IMeterReadingItem[] }>) {
      state.isLoading = false;
      state.readings = action.payload.data;
      state.storeReadings[action.payload.storeId] = action.payload.data;
      state.error = null;
    },

    // Vérifier un relevé
    verifyReadingSuccess(state, action: PayloadAction<{ id: string; status: MeterReadingStatus; verified_by: any; verified_at: string }>) {
      state.isLoading = false;
      const { id, status, verified_by, verified_at } = action.payload;
      
      // Mettre à jour dans la liste principale
      state.readings = state.readings.map(reading =>
        reading.id === id 
          ? { 
              ...reading, 
              status, 
              verified_by, 
              verified_at 
            } 
          : reading
      );

      // Mettre à jour dans le cache des magasins
      Object.keys(state.storeReadings).forEach(storeId => {
        state.storeReadings[storeId] = state.storeReadings[storeId].map(reading =>
          reading.id === id 
            ? { 
                ...reading, 
                status, 
                verified_by, 
                verified_at 
              }
            : reading
        );
      });

      // Mettre à jour le relevé courant si c'est celui-ci
      if (state.currentReading?.id === id) {
        state.currentReading = { 
          ...state.currentReading, 
          status, 
          verified_by, 
          verified_at 
        };
      }

      state.error = null;
    },

    // Définir le relevé courant
    setCurrentReading(state, action: PayloadAction<IMeterReadingItem | null>) {
      state.currentReading = action.payload;
    },

    // Supprimer un relevé
    deleteReadingSuccess(state, action: PayloadAction<string>) {
      state.isLoading = false;
      const readingId = action.payload;

      // Supprimer de la liste principale
      state.readings = state.readings.filter(reading => reading.id !== readingId);

      // Supprimer du cache des magasins
      Object.keys(state.storeReadings).forEach(storeId => {
        state.storeReadings[storeId] = state.storeReadings[storeId].filter(
          reading => reading.id !== readingId
        );
      });

      // Réinitialiser le relevé courant si c'est celui supprimé
      if (state.currentReading?.id === readingId) {
        state.currentReading = null;
      }

      state.error = null;
    },

    // Mettre à jour les statistiques
    updateStatsSuccess(state, action: PayloadAction<MeterReadingState['stats']>) {
      state.stats = action.payload;
    },

    // Mettre à jour les filtres
    setFilters(state, action: PayloadAction<Partial<IMeterReadingFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Réinitialiser les filtres
    resetFilters(state) {
      state.filters = initialState.filters;
    },

    // Vider le cache d'un magasin
    clearStoreCache(state, action: PayloadAction<string>) {
      const storeId = action.payload;
      delete state.storeReadings[storeId];
    },

    // Vider tout le cache
    clearAllCache(state) {
      state.storeReadings = {};
      state.readings = [];
      state.currentReading = null;
    },

    // Réinitialiser l'état
    resetState(state) {
      state.isLoading = initialState.isLoading;
      state.error = initialState.error;
      state.readings = initialState.readings;
      state.currentReading = initialState.currentReading;
      state.storeReadings = initialState.storeReadings;
      state.stats = initialState.stats;
      state.filters = initialState.filters;
    },
  },
});

// Actions
export const {
  startLoading,
  hasError,
  getStoreReadingsSuccess,
  verifyReadingSuccess,
  setCurrentReading,
  deleteReadingSuccess,
  updateStatsSuccess,
  setFilters,
  resetFilters,
  clearStoreCache,
  clearAllCache,
  resetState,
} = meterReadingSlice.actions;

// Thunks (Actions asynchrones)
export const fetchStoreReadings = (storeId: string, filters?: IMeterReadingFilters) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(startLoading());
      const response: MeterReadingListResponse = await meterReadingRequests.getStoreReadings(storeId, filters);
      dispatch(getStoreReadingsSuccess({ storeId, data: response.data }));
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des relevés';
      dispatch(hasError(errorMessage));
      throw error;
    }
  };

export const verifyReading = (id: string, payload: IVerifyReadingPayload) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(startLoading());
      const response: VerifyReadingResponse = await meterReadingRequests.verifyReading(id, payload);
      dispatch(verifyReadingSuccess({
        id,
        status: payload.status,
        verified_by: response.data.verified_by,
        verified_at: response.data.verified_at,
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la vérification';
      dispatch(hasError(errorMessage));
      throw error;
    }
  };

export const deleteReading = (id: string) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(startLoading());
      // Note: Cette fonction nécessiterait une API endpoint pour supprimer
      // await meterReadingRequests.deleteReading(id);
      // Pour l'instant, on simule la suppression
      await new Promise(resolve => setTimeout(resolve, 500));
      dispatch(deleteReadingSuccess(id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      dispatch(hasError(errorMessage));
      throw error;
    }
  };

export const fetchReadingStats = (storeId: string, period?: string) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(startLoading());
      // Simuler des statistiques (à remplacer par l'appel API réel)
      const stats = {
        total: 150,
        pending: 25,
        verified: 100,
        rejected: 25,
        byType: {
          opening: 50,
          closing: 50,
          daily: 50,
        },
      };
      dispatch(updateStatsSuccess(stats));
      return stats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques';
      dispatch(hasError(errorMessage));
      throw error;
    }
  };

export const fetchReadingDetails = (id: string) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(startLoading());
      // Simuler la récupération des détails (à remplacer par l'appel API réel)
      const reading: IMeterReadingItem = {
        id,
        reading_value: 12345,
        reading_type: 'daily',
        photo: 'https://example.com/photo.jpg',
        status: 'pending',
        cashier: {
          _id: 'cashier1',
          first_name: 'Jean',
          last_name: 'Dupont',
        },
        created_at: new Date().toISOString(),
      };
      dispatch(setCurrentReading(reading));
      return reading;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des détails';
      dispatch(hasError(errorMessage));
      throw error;
    }
  };

// Selectors
export const selectMeterReadingState = (state: RootState) => state.meterReading;
export const selectMeterReadings = (state: RootState) => state.meterReading.readings;
export const selectCurrentMeterReading = (state: RootState) => state.meterReading.currentReading;
export const selectMeterReadingLoading = (state: RootState) => state.meterReading.isLoading;
export const selectMeterReadingError = (state: RootState) => state.meterReading.error;
export const selectMeterReadingStats = (state: RootState) => state.meterReading.stats;
export const selectMeterReadingFilters = (state: RootState) => state.meterReading.filters;

// Selectors enrichis
export const selectStoreReadings = (storeId: string) => (state: RootState) => 
  state.meterReading.storeReadings[storeId] || [];

export const selectReadingsByStatus = (status: MeterReadingStatus) => (state: RootState) => 
  state.meterReading.readings.filter(reading => reading.status === status);

export const selectPendingReadings = (state: RootState) => 
  state.meterReading.readings.filter(reading => reading.status === 'pending');

export const selectVerifiedReadings = (state: RootState) => 
  state.meterReading.readings.filter(reading => reading.status === 'verified');

export const selectRejectedReadings = (state: RootState) => 
  state.meterReading.readings.filter(reading => reading.status === 'rejected');

export const selectReadingsByType = (type: MeterReadingType) => (state: RootState) => 
  state.meterReading.readings.filter(reading => reading.reading_type === type);

export const selectReadingsByCashier = (cashierId: string) => (state: RootState) => 
  state.meterReading.readings.filter(reading => reading.cashier._id === cashierId);

// Selector pour les statistiques par magasin
export const selectStoreReadingStats = (storeId: string) => (state: RootState) => {
  const storeReadings = state.meterReading.storeReadings[storeId] || [];
  return {
    total: storeReadings.length,
    pending: storeReadings.filter(r => r.status === 'pending').length,
    verified: storeReadings.filter(r => r.status === 'verified').length,
    rejected: storeReadings.filter(r => r.status === 'rejected').length,
    byType: storeReadings.reduce((acc, reading) => {
      acc[reading.reading_type] = (acc[reading.reading_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
};

// Selector pour les relevés filtrés
export const selectFilteredReadings = (state: RootState) => {
  const { readings, filters } = state.meterReading;
  let filtered = readings;

  if (filters.status !== 'all') {
    filtered = filtered.filter(reading => reading.status === filters.status);
  }

  if (filters.type !== 'all') {
    filtered = filtered.filter(reading => reading.reading_type === filters.type);
  }

  if (filters.date) {
    filtered = filtered.filter(reading => 
      new Date(reading.created_at).toDateString() === new Date(filters.date!).toDateString()
    );
  }

  return filtered;
};

export default meterReadingSlice.reducer;
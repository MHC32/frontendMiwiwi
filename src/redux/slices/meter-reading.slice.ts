// src/redux/slices/meter-reading.slice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch } from 'src/redux/store';
import { meterReadingRequests } from 'src/utils/request';
import type { 
  IMeterReadingItem, 
  IMeterReadingFilters,
  MeterReadingListResponse,
  IVerifyReadingPayload,
  VerifyReadingResponse
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
    verifyReadingSuccess(state, action: PayloadAction<{ id: string; status: string; verified_by: any; verified_at: string }>) {
      state.isLoading = false;
      const { id, status, verified_by, verified_at } = action.payload;
      
      // Mettre à jour dans la liste principale
      state.readings = state.readings.map(reading =>
        reading.id === id 
          ? { ...reading, status: status as any, verified_by, verified_at } 
          : reading
      );

      // Mettre à jour dans le cache des magasins
      Object.keys(state.storeReadings).forEach(storeId => {
        state.storeReadings[storeId] = state.storeReadings[storeId].map(reading =>
          reading.id === id 
            ? { ...reading, status: status as any, verified_by, verified_at }
            : reading
        );
      });

      // Mettre à jour le relevé courant si c'est celui-ci
      if (state.currentReading?.id === id) {
        state.currentReading = { 
          ...state.currentReading, 
          status: status as any, 
          verified_by, 
          verified_at 
        };
      }

      state.error = null;
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
  },
});

// Actions
export const {
  startLoading,
  hasError,
  getStoreReadingsSuccess,
  verifyReadingSuccess,
  deleteReadingSuccess,
  updateStatsSuccess,
  setFilters,
  resetFilters,
  clearStoreCache,
  clearAllCache,
} = meterReadingSlice.actions;

// Thunks (Actions asynchrones)
export const fetchStoreReadings = (storeId: string, filters?: IMeterReadingFilters) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(startLoading());
      const response = await meterReadingRequests.getStoreReadings(storeId, filters);
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
      const response = await meterReadingRequests.verifyReading(id, payload);
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
      const stats = await meterReadingRequests.getReadingStats(storeId, period);
      dispatch(updateStatsSuccess(stats));
      return stats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques';
      dispatch(hasError(errorMessage));
      throw error;
    }
  };

// Selectors
export const selectMeterReadingState = (state: { meterReading: MeterReadingState }) => state.meterReading;
export const selectMeterReadings = (state: { meterReading: MeterReadingState }) => state.meterReading.readings;
export const selectCurrentMeterReading = (state: { meterReading: MeterReadingState }) => state.meterReading.currentReading;
export const selectMeterReadingLoading = (state: { meterReading: MeterReadingState }) => state.meterReading.isLoading;
export const selectMeterReadingError = (state: { meterReading: MeterReadingState }) => state.meterReading.error;
export const selectMeterReadingStats = (state: { meterReading: MeterReadingState }) => state.meterReading.stats;
export const selectMeterReadingFilters = (state: { meterReading: MeterReadingState }) => state.meterReading.filters;

// Selectors enrichis
export const selectStoreReadings = (storeId: string) => (state: { meterReading: MeterReadingState }) => 
  state.meterReading.storeReadings[storeId] || [];

export const selectReadingsByStatus = (status: string) => (state: { meterReading: MeterReadingState }) => 
  state.meterReading.readings.filter(reading => reading.status === status);

export const selectPendingReadings = (state: { meterReading: MeterReadingState }) => 
  state.meterReading.readings.filter(reading => reading.status === 'pending');

export const selectVerifiedReadings = (state: { meterReading: MeterReadingState }) => 
  state.meterReading.readings.filter(reading => reading.status === 'verified');

export const selectRejectedReadings = (state: { meterReading: MeterReadingState }) => 
  state.meterReading.readings.filter(reading => reading.status === 'rejected');

export const selectReadingsByType = (type: string) => (state: { meterReading: MeterReadingState }) => 
  state.meterReading.readings.filter(reading => reading.reading_type === type);

export const selectReadingsByCashier = (cashierId: string) => (state: { meterReading: MeterReadingState }) => 
  state.meterReading.readings.filter(reading => reading.cashier._id === cashierId);

// Selector pour les statistiques par magasin
export const selectStoreReadingStats = (storeId: string) => (state: { meterReading: MeterReadingState }) => {
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

export default meterReadingSlice.reducer;
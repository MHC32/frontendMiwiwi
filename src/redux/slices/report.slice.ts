// src/redux/slices/report.slice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch } from 'src/redux/store';
import { reportRequests } from 'src/utils/request';
import type { 
  IOwnerOverview,
  IStoreReport,
  ReportQueryParams,
  IReportFilters,
  ReportPeriod,

} from 'src/types/report';

import { getDateRangeFromPeriod } from 'src/types/report';
interface ReportState {
  isLoading: boolean;
  error: string | null;
  ownerOverview: IOwnerOverview | null;
  storeReport: IStoreReport | null;
  filters: IReportFilters;
  selectedStoreId: string | null;
}

const initialState: ReportState = {
  isLoading: false,
  error: null,
  ownerOverview: null,
  storeReport: null,
  filters: {
    startDate: null,
    endDate: null,
    period: 'month' as ReportPeriod,
    storeId: undefined,
  },
  selectedStoreId: null,
};

const reportSlice = createSlice({
  name: 'report',
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
    getOwnerOverviewSuccess(state, action: PayloadAction<IOwnerOverview>) {
      state.isLoading = false;
      state.ownerOverview = action.payload;
    },
    getStoreReportSuccess(state, action: PayloadAction<IStoreReport>) {
      state.isLoading = false;
      state.storeReport = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<IReportFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPeriod(state, action: PayloadAction<ReportPeriod>) {
      state.filters.period = action.payload;
      
      // Auto-calculer les dates si ce n'est pas "custom"
      if (action.payload !== 'custom') {
        const { startDate, endDate } = getDateRangeFromPeriod(action.payload);
        state.filters.startDate = startDate;
        state.filters.endDate = endDate;
      }
    },
    setDateRange(state, action: PayloadAction<{ startDate: Date | null; endDate: Date | null }>) {
      state.filters.startDate = action.payload.startDate;
      state.filters.endDate = action.payload.endDate;
      state.filters.period = 'custom';
    },
    setSelectedStore(state, action: PayloadAction<string | null>) {
      state.selectedStoreId = action.payload;
      state.filters.storeId = action.payload || undefined;
    },
    resetFilters(state) {
      state.filters = initialState.filters;
      state.selectedStoreId = null;
    },
    clearReports(state) {
      state.ownerOverview = null;
      state.storeReport = null;
    }
  },
});

// Actions
export const {
  startLoading,
  hasError,
  getOwnerOverviewSuccess,
  getStoreReportSuccess,
  setFilters,
  setPeriod,
  setDateRange,
  setSelectedStore,
  resetFilters,
  clearReports,
} = reportSlice.actions;

// Thunks
export const fetchOwnerOverview = (params?: Partial<ReportQueryParams>) => 
  async (dispatch: AppDispatch, getState: () => any) => {
    try {
      dispatch(startLoading());
      
      const { report } = getState();
      const { startDate, endDate } = report.filters;
      
      if (!startDate || !endDate) {
        throw new Error('Dates de début et de fin requises');
      }

      const queryParams: ReportQueryParams = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        ...params
      };

      const response = await reportRequests.getOwnerOverview(queryParams);
      dispatch(getOwnerOverviewSuccess(response.data));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement du rapport';
      dispatch(hasError(message));
      throw error;
    }
  };

export const fetchStoreReport = (storeId: string, params?: Partial<ReportQueryParams>) => 
  async (dispatch: AppDispatch, getState: () => any) => {
    try {
      dispatch(startLoading());
      
      const { report } = getState();
      const { startDate, endDate } = report.filters;
      
      if (!startDate || !endDate) {
        throw new Error('Dates de début et de fin requises');
      }

      const queryParams: ReportQueryParams = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        ...params
      };

      const response = await reportRequests.getStoreReport(storeId, queryParams);
      dispatch(getStoreReportSuccess(response.data));
      dispatch(setSelectedStore(storeId));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement du rapport';
      dispatch(hasError(message));
      throw error;
    }
  };

// Action pour initialiser les filtres avec période par défaut
export const initializeReportFilters = (period: ReportPeriod = 'month') => 
  (dispatch: AppDispatch) => {
    dispatch(setPeriod(period));
  };

// Action pour mettre à jour les filtres et recharger les données
export const updateFiltersAndRefresh = (
  filters: Partial<IReportFilters>, 
  refreshOverview: boolean = true
) => 
  async (dispatch: AppDispatch, getState: () => any) => {
    dispatch(setFilters(filters));
    
    if (refreshOverview) {
      await dispatch(fetchOwnerOverview());
    }
    
    // Si un magasin est sélectionné, rafraîchir aussi son rapport
    const { report } = getState();
    if (report.selectedStoreId) {
      await dispatch(fetchStoreReport(report.selectedStoreId));
    }
  };

// Selectors
export const selectReportState = (state: { report: ReportState }) => state.report;
export const selectOwnerOverview = (state: { report: ReportState }) => state.report.ownerOverview;
export const selectStoreReport = (state: { report: ReportState }) => state.report.storeReport;
export const selectReportLoading = (state: { report: ReportState }) => state.report.isLoading;
export const selectReportError = (state: { report: ReportState }) => state.report.error;
export const selectReportFilters = (state: { report: ReportState }) => state.report.filters;
export const selectSelectedStoreId = (state: { report: ReportState }) => state.report.selectedStoreId;

// Selector pour vérifier si les filtres sont valides
export const selectFiltersValid = (state: { report: ReportState }) => {
  const { startDate, endDate } = state.report.filters;
  return startDate && endDate && startDate <= endDate;
};

// Selector pour les métriques calculées
export const selectReportMetrics = (state: { report: ReportState }) => {
  const overview = state.report.ownerOverview;
  if (!overview) return null;

  const topStore = overview.stores.reduce((max, store) => 
    store.revenue > (max?.revenue || 0) ? {
      name: store.storeInfo[0]?.name || 'N/A',
      revenue: store.revenue
    } : max, 
    null as { name: string; revenue: number } | null
  );

  return {
    totalRevenue: overview.totalRevenue,
    totalOrders: overview.totalOrders,
    averageOrderValue: overview.totalOrders > 0 ? overview.totalRevenue / overview.totalOrders : 0,
    topStore,
  };
};

export default reportSlice.reducer;
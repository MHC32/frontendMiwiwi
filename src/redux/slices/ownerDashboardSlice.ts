// src/redux/slices/ownerDashboardSlice.ts

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../store';
import { ownerDashboardRequests } from 'src/utils/request';
import type {
  IDailyStatsResponse,
  ISalesByProductResponse,
  ISalesByMonthResponse,
  IStatsByStoreResponse,
  ITopProductsResponse,
  ISalesTrendsResponse,
  IDashboardFilters,
  ISalesByProductParams,
  ISalesByMonthParams,
  ITopProductsParams,
  ISalesTrendsParams,
} from 'src/types/owner-dashboard';

/**
 * OWNER DASHBOARD SLICE
 * Gère l'état des métriques et statistiques du dashboard owner
 */

// ============================================================================
// INTERFACE
// ============================================================================

interface OwnerDashboardState {
  dailyStats: IDailyStatsResponse['data'] | null;
  salesByProduct: ISalesByProductResponse['data'] | null;
  salesByMonth: ISalesByMonthResponse['data'] | null;
  statsByStore: IStatsByStoreResponse['data'] | null;
  topProducts: ITopProductsResponse['data'] | null;
  salesTrends: ISalesTrendsResponse['data'] | null;
  isLoading: {
    dailyStats: boolean;
    salesByProduct: boolean;
    salesByMonth: boolean;
    statsByStore: boolean;
    topProducts: boolean;
    salesTrends: boolean;
  };
  error: string | null;
  filters: IDashboardFilters;
  lastUpdated: Date | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: OwnerDashboardState = {
  dailyStats: null,
  salesByProduct: null,
  salesByMonth: null,
  statsByStore: null,
  topProducts: null,
  salesTrends: null,
  isLoading: {
    dailyStats: false,
    salesByProduct: false,
    salesByMonth: false,
    statsByStore: false,
    topProducts: false,
    salesTrends: false,
  },
  error: null,
  filters: {
    storeId: null,
    period: 'today',
    startDate: null,
    endDate: null,
  },
  lastUpdated: null,
};

// ============================================================================
// SLICE
// ============================================================================

const ownerDashboardSlice = createSlice({
  name: 'ownerDashboard',
  initialState,
  reducers: {
    // Daily Stats
    getDailyStatsStart(state) {
      state.isLoading.dailyStats = true;
      state.error = null;
    },
    getDailyStatsSuccess(state, action: PayloadAction<IDailyStatsResponse['data']>) {
      state.isLoading.dailyStats = false;
      state.dailyStats = action.payload;
      state.lastUpdated = new Date();
      state.error = null;
    },
    getDailyStatsFailure(state, action: PayloadAction<string>) {
      state.isLoading.dailyStats = false;
      state.error = action.payload;
    },

    // Sales by Product
    getSalesByProductStart(state) {
      state.isLoading.salesByProduct = true;
      state.error = null;
    },
    getSalesByProductSuccess(state, action: PayloadAction<ISalesByProductResponse['data']>) {
      state.isLoading.salesByProduct = false;
      state.salesByProduct = action.payload;
      state.lastUpdated = new Date();
      state.error = null;
    },
    getSalesByProductFailure(state, action: PayloadAction<string>) {
      state.isLoading.salesByProduct = false;
      state.error = action.payload;
    },

    // Sales by Month
    getSalesByMonthStart(state) {
      state.isLoading.salesByMonth = true;
      state.error = null;
    },
    getSalesByMonthSuccess(state, action: PayloadAction<ISalesByMonthResponse['data']>) {
      state.isLoading.salesByMonth = false;
      state.salesByMonth = action.payload;
      state.lastUpdated = new Date();
      state.error = null;
    },
    getSalesByMonthFailure(state, action: PayloadAction<string>) {
      state.isLoading.salesByMonth = false;
      state.error = action.payload;
    },

    // Stats by Store
    getStatsByStoreStart(state) {
      state.isLoading.statsByStore = true;
      state.error = null;
    },
    getStatsByStoreSuccess(state, action: PayloadAction<IStatsByStoreResponse['data']>) {
      state.isLoading.statsByStore = false;
      state.statsByStore = action.payload;
      state.lastUpdated = new Date();
      state.error = null;
    },
    getStatsByStoreFailure(state, action: PayloadAction<string>) {
      state.isLoading.statsByStore = false;
      state.error = action.payload;
    },

    // Top Products
    getTopProductsStart(state) {
      state.isLoading.topProducts = true;
      state.error = null;
    },
    getTopProductsSuccess(state, action: PayloadAction<ITopProductsResponse['data']>) {
      state.isLoading.topProducts = false;
      state.topProducts = action.payload;
      state.lastUpdated = new Date();
      state.error = null;
    },
    getTopProductsFailure(state, action: PayloadAction<string>) {
      state.isLoading.topProducts = false;
      state.error = action.payload;
    },

    // Sales Trends
    getSalesTrendsStart(state) {
      state.isLoading.salesTrends = true;
      state.error = null;
    },
    getSalesTrendsSuccess(state, action: PayloadAction<ISalesTrendsResponse['data']>) {
      state.isLoading.salesTrends = false;
      state.salesTrends = action.payload;
      state.lastUpdated = new Date();
      state.error = null;
    },
    getSalesTrendsFailure(state, action: PayloadAction<string>) {
      state.isLoading.salesTrends = false;
      state.error = action.payload;
    },

    // Filters
    setDashboardFilters(state, action: PayloadAction<Partial<IDashboardFilters>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    resetDashboardFilters(state) {
      state.filters = initialState.filters;
    },

    // Reset
    resetDashboardState(state) {
      Object.assign(state, initialState);
    },
    clearDashboardError(state) {
      state.error = null;
    },
  },
});

// ============================================================================
// EXPORTS DES ACTIONS
// ============================================================================

export const {
  getDailyStatsStart,
  getDailyStatsSuccess,
  getDailyStatsFailure,
  getSalesByProductStart,
  getSalesByProductSuccess,
  getSalesByProductFailure,
  getSalesByMonthStart,
  getSalesByMonthSuccess,
  getSalesByMonthFailure,
  getStatsByStoreStart,
  getStatsByStoreSuccess,
  getStatsByStoreFailure,
  getTopProductsStart,
  getTopProductsSuccess,
  getTopProductsFailure,
  getSalesTrendsStart,
  getSalesTrendsSuccess,
  getSalesTrendsFailure,
  setDashboardFilters,
  resetDashboardFilters,
  resetDashboardState,
  clearDashboardError,
} = ownerDashboardSlice.actions;

export default ownerDashboardSlice.reducer;

// ============================================================================
// THUNKS (Actions asynchrones)
// ============================================================================

/**
 * Récupérer les statistiques quotidiennes
 */
export const fetchDailyStats = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(getDailyStatsStart());
    const response = await ownerDashboardRequests.getDailyStats();
    dispatch(getDailyStatsSuccess(response.data));
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des statistiques';
    dispatch(getDailyStatsFailure(errorMessage));
    throw error;
  }
};

/**
 * Récupérer les ventes par produit
 */
export const fetchSalesByProduct = (params?: ISalesByProductParams) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(getSalesByProductStart());
      const response = await ownerDashboardRequests.getSalesByProduct(params);
      dispatch(getSalesByProductSuccess(response.data));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des ventes par produit';
      dispatch(getSalesByProductFailure(errorMessage));
      throw error;
    }
  };

/**
 * Récupérer les ventes mensuelles
 */
export const fetchSalesByMonth = (params?: ISalesByMonthParams) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(getSalesByMonthStart());
      const response = await ownerDashboardRequests.getSalesByMonth(params);
      dispatch(getSalesByMonthSuccess(response.data));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des ventes mensuelles';
      dispatch(getSalesByMonthFailure(errorMessage));
      throw error;
    }
  };

/**
 * Récupérer les statistiques par magasin
 */
export const fetchStatsByStore = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(getStatsByStoreStart());
    const response = await ownerDashboardRequests.getStatsByStore();
    dispatch(getStatsByStoreSuccess(response.data));
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des statistiques par magasin';
    dispatch(getStatsByStoreFailure(errorMessage));
    throw error;
  }
};

/**
 * Récupérer les produits les plus vendus
 */
export const fetchTopProducts = (params?: ITopProductsParams) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(getTopProductsStart());
      const response = await ownerDashboardRequests.getTopProducts(params);
      dispatch(getTopProductsSuccess(response.data));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des top produits';
      dispatch(getTopProductsFailure(errorMessage));
      throw error;
    }
  };

/**
 * Récupérer les tendances de ventes
 */
export const fetchSalesTrends = (params?: ISalesTrendsParams) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(getSalesTrendsStart());
      const response = await ownerDashboardRequests.getSalesTrends(params);
      dispatch(getSalesTrendsSuccess(response.data));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des tendances';
      dispatch(getSalesTrendsFailure(errorMessage));
      throw error;
    }
  };

/**
 * Charger les données initiales du dashboard
 * (Appelé au montage du composant)
 */
export const loadInitialDashboardData = () => async (dispatch: AppDispatch) => {
  try {
    await Promise.all([
      dispatch(fetchDailyStats()),
      dispatch(fetchSalesByProduct({ period: 'today' })),
      dispatch(fetchSalesByMonth({ year: new Date().getFullYear() })),
      dispatch(fetchStatsByStore()),
    ]);
  } catch (error) {
    console.error('Erreur lors du chargement initial du dashboard:', error);
  }
};

/**
 * Rafraîchir toutes les métriques du dashboard
 */
export const refreshAllDashboardMetrics = (params?: {
  productPeriod?: ISalesByProductParams['period'];
  year?: number;
}) => async (dispatch: AppDispatch) => {
  try {
    await Promise.all([
      dispatch(fetchDailyStats()),
      dispatch(fetchSalesByProduct({ period: params?.productPeriod || 'today' })),
      dispatch(fetchSalesByMonth({ year: params?.year || new Date().getFullYear() })),
      dispatch(fetchStatsByStore()),
    ]);
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du dashboard:', error);
  }
};

// ============================================================================
// SELECTORS
// ============================================================================

const selectOwnerDashboardState = (state: RootState) => state.ownerDashboard;

// Données de base
export const selectDailyStats = createSelector(
  [selectOwnerDashboardState],
  (dashboard) => dashboard.dailyStats
);

export const selectSalesByProduct = createSelector(
  [selectOwnerDashboardState],
  (dashboard) => dashboard.salesByProduct
);

export const selectSalesByMonth = createSelector(
  [selectOwnerDashboardState],
  (dashboard) => dashboard.salesByMonth
);

export const selectStatsByStore = createSelector(
  [selectOwnerDashboardState],
  (dashboard) => dashboard.statsByStore
);

export const selectTopProducts = createSelector(
  [selectOwnerDashboardState],
  (dashboard) => dashboard.topProducts
);

export const selectSalesTrends = createSelector(
  [selectOwnerDashboardState],
  (dashboard) => dashboard.salesTrends
);

// États de chargement
export const selectLoadingStates = createSelector(
  [selectOwnerDashboardState],
  (dashboard) => dashboard.isLoading
);

export const selectIsAnyLoading = createSelector(
  [selectLoadingStates],
  (loadingStates) => Object.values(loadingStates).some((isLoading) => isLoading)
);

export const selectIsAllLoaded = createSelector(
  [selectLoadingStates],
  (loadingStates) => Object.values(loadingStates).every((isLoading) => !isLoading)
);

// Erreurs
export const selectDashboardError = createSelector(
  [selectOwnerDashboardState],
  (dashboard) => dashboard.error
);

export const selectHasError = createSelector(
  [selectDashboardError],
  (error) => error !== null
);

// Filtres
export const selectDashboardFilters = createSelector(
  [selectOwnerDashboardState],
  (dashboard) => dashboard.filters
);

export const selectSelectedPeriod = createSelector(
  [selectDashboardFilters],
  (filters) => filters.period
);

// Métadonnées
export const selectLastUpdated = createSelector(
  [selectOwnerDashboardState],
  (dashboard) => dashboard.lastUpdated
);

// Sélecteurs calculés
export const selectDashboardSummary = createSelector(
  [selectDailyStats, selectStatsByStore, selectTopProducts, selectSalesByMonth],
  (dailyStats, statsByStore, topProducts, salesByMonth) => ({
    dailySales: dailyStats?.dailySales.amount || '0.00',
    dailyTickets: dailyStats?.dailyTickets.count || 0,
    connectedCashiers: dailyStats?.connectedCashiers.count || 0,
    totalStores: statsByStore?.totalStores || 0,
    topProductsCount: topProducts?.topProducts.length || 0,
    yearTotal: salesByMonth?.summary.totalSales || '0.00',
    currency: dailyStats?.currency || 'HTG',
  })
);

export const selectTopPerformingStore = createSelector(
  [selectStatsByStore],
  (statsByStore) => {
    if (!statsByStore || !statsByStore.stores.length) return null;
    
    return statsByStore.stores.reduce((best, current) => {
      const bestSales = parseFloat(best.todaySales);
      const currentSales = parseFloat(current.todaySales);
      return currentSales > bestSales ? current : best;
    });
  }
);
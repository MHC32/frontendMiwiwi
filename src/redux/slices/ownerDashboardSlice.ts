// src/store/slices/ownerDashboardSlice.ts

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type {
  IDailyStatsResponse,
  ISalesByProductResponse,
  ISalesByMonthResponse,
  IStatsByStoreResponse,
  ITopProductsResponse,
  ISalesTrendsResponse,
  IDashboardFilters,
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
    // Daily Stats - Statistiques quotidiennes
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

    // Sales by Product - Répartition des ventes par produit
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

    // Sales by Month - Ventes mensuelles
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

    // Stats by Store - Statistiques par magasin
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

    // Top Products - Produits les plus vendus
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

    // Sales Trends - Tendances de ventes
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

    // Refresh All - Rafraîchir toutes les métriques
    refreshAllMetricsStart(state) {
      state.isLoading = {
        dailyStats: true,
        salesByProduct: true,
        salesByMonth: true,
        statsByStore: true,
        topProducts: true,
        salesTrends: true,
      };
      state.error = null;
    },
    refreshAllMetricsSuccess(
      state,
      action: PayloadAction<{
        dailyStats: IDailyStatsResponse['data'];
        salesByProduct: ISalesByProductResponse['data'];
        salesByMonth: ISalesByMonthResponse['data'];
        statsByStore: IStatsByStoreResponse['data'];
        topProducts: ITopProductsResponse['data'];
        salesTrends: ISalesTrendsResponse['data'];
      }>
    ) {
      state.isLoading = {
        dailyStats: false,
        salesByProduct: false,
        salesByMonth: false,
        statsByStore: false,
        topProducts: false,
        salesTrends: false,
      };
      state.dailyStats = action.payload.dailyStats;
      state.salesByProduct = action.payload.salesByProduct;
      state.salesByMonth = action.payload.salesByMonth;
      state.statsByStore = action.payload.statsByStore;
      state.topProducts = action.payload.topProducts;
      state.salesTrends = action.payload.salesTrends;
      state.lastUpdated = new Date();
      state.error = null;
    },
    refreshAllMetricsFailure(state, action: PayloadAction<string>) {
      state.isLoading = {
        dailyStats: false,
        salesByProduct: false,
        salesByMonth: false,
        statsByStore: false,
        topProducts: false,
        salesTrends: false,
      };
      state.error = action.payload;
    },

    // Filters - Gestion des filtres
    setDashboardFilters(state, action: PayloadAction<Partial<IDashboardFilters>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    resetDashboardFilters(state) {
      state.filters = initialState.filters;
    },

    // Reset - Réinitialisation
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
  // Daily Stats
  getDailyStatsStart,
  getDailyStatsSuccess,
  getDailyStatsFailure,
  // Sales by Product
  getSalesByProductStart,
  getSalesByProductSuccess,
  getSalesByProductFailure,
  // Sales by Month
  getSalesByMonthStart,
  getSalesByMonthSuccess,
  getSalesByMonthFailure,
  // Stats by Store
  getStatsByStoreStart,
  getStatsByStoreSuccess,
  getStatsByStoreFailure,
  // Top Products
  getTopProductsStart,
  getTopProductsSuccess,
  getTopProductsFailure,
  // Sales Trends
  getSalesTrendsStart,
  getSalesTrendsSuccess,
  getSalesTrendsFailure,
  // Refresh All
  refreshAllMetricsStart,
  refreshAllMetricsSuccess,
  refreshAllMetricsFailure,
  // Filters
  setDashboardFilters,
  resetDashboardFilters,
  // Reset
  resetDashboardState,
  clearDashboardError,
} = ownerDashboardSlice.actions;

export default ownerDashboardSlice.reducer;

// ============================================================================
// SELECTORS
// ============================================================================

// Sélecteur de base
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

export const selectIsDailyStatsLoading = createSelector(
  [selectLoadingStates],
  (loadingStates) => loadingStates.dailyStats
);

export const selectIsSalesByProductLoading = createSelector(
  [selectLoadingStates],
  (loadingStates) => loadingStates.salesByProduct
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

export const selectShouldRefresh = createSelector(
  [selectLastUpdated],
  (lastUpdated) => {
    if (!lastUpdated) return true;
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - new Date(lastUpdated).getTime() > fiveMinutes;
  }
);

// Sélecteurs calculés
export const selectTotalDailySales = createSelector(
  [selectDailyStats],
  (dailyStats) => {
    if (!dailyStats) return '0.00';
    return dailyStats.dailySales.amount;
  }
);

export const selectTotalStoresCount = createSelector(
  [selectStatsByStore],
  (statsByStore) => {
    if (!statsByStore) return 0;
    return statsByStore.totalStores;
  }
);

export const selectTotalConnectedCashiers = createSelector(
  [selectDailyStats],
  (dailyStats) => {
    if (!dailyStats) return 0;
    return dailyStats.connectedCashiers.count;
  }
);

export const selectTotalDailyTickets = createSelector(
  [selectDailyStats],
  (dailyStats) => {
    if (!dailyStats) return 0;
    return dailyStats.dailyTickets.count;
  }
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

export const selectTop3Products = createSelector(
  [selectTopProducts],
  (topProducts) => {
    if (!topProducts) return [];
    return topProducts.topProducts.slice(0, 3);
  }
);

export const selectTopProductsTotalRevenue = createSelector(
  [selectTopProducts],
  (topProducts) => {
    if (!topProducts) return 0;
    return topProducts.topProducts.reduce((sum, product) => sum + product.totalRevenue, 0);
  }
);

export const selectSalesByProductChartData = createSelector(
  [selectSalesByProduct],
  (salesByProduct) => {
    if (!salesByProduct) return [];
    return salesByProduct.products.map((product) => ({
      name: product.name,
      value: product.value,
      color: product.color,
    }));
  }
);

export const selectSalesByMonthChartData = createSelector(
  [selectSalesByMonth],
  (salesByMonth) => {
    if (!salesByMonth) return [];
    return salesByMonth.monthlyData.map((month) => ({
      month: month.month,
      sales: month.sales,
      orders: month.orders,
    }));
  }
);

export const selectHasDashboardData = createSelector(
  [selectDailyStats, selectSalesByProduct, selectStatsByStore],
  (dailyStats, salesByProduct, statsByStore) => {
    return !!(dailyStats || salesByProduct || statsByStore);
  }
);

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
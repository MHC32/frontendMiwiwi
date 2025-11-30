// src/types/owner-dashboard.ts

/**
 * TYPES POUR LE DASHBOARD OWNER
 * Métriques et statistiques pour tous les magasins
 */

// ============================================================================
// DAILY STATS - Statistiques quotidiennes
// ============================================================================

export type IDailyStatsMetric = {
  count: number;
  label: string;
  variation?: string;
};

export type IDailySalesMetric = {
  amount: string;
  variation: string;
  completedOrders: number;
  label: string;
};

export type IDailyStatsResponse = {
  success: boolean;
  data: {
    connectedCashiers: IDailyStatsMetric;
    dailyTickets: IDailyStatsMetric & { variation: string };
    dailySales: IDailySalesMetric;
    currency: string;
    storesCount: number;
  };
};

// ============================================================================
// SALES BY PRODUCT - Répartition des ventes par produit (Donut Chart)
// ============================================================================

export type IProductSalesItem = {
  name: string;
  value: number;
  quantity: number;
  percentage: string;
  color: string;
};

export type ISalesByProductResponse = {
  success: boolean;
  data: {
    products: IProductSalesItem[];
    totalSales: string;
    period: 'today' | 'week' | 'month' | 'year';
    currency: string;
    storesCount: number;
  };
};

export type ISalesByProductParams = {
  period?: 'today' | 'week' | 'month' | 'year';
};

// ============================================================================
// SALES BY MONTH - Ventes mensuelles (Line Chart)
// ============================================================================

export type IMonthlySalesItem = {
  month: string;
  monthNumber: number;
  sales: number;
  orders: number;
};

export type IMonthlySalesSummary = {
  totalSales: string;
  totalOrders: number;
  averageMonthlySales: string;
  yearOverYearGrowth: string;
};

export type ISalesByMonthResponse = {
  success: boolean;
  data: {
    year: number;
    monthlyData: IMonthlySalesItem[];
    summary: IMonthlySalesSummary;
    currency: string;
    storesCount: number;
  };
};

export type ISalesByMonthParams = {
  year?: number;
};

// ============================================================================
// STATS BY STORE - Statistiques par magasin
// ============================================================================

export type IStoreStatsItem = {
  storeId: string;
  storeName: string;
  storeLocation: string;
  connectedCashiers: number;
  ticketsCount: number;
  todaySales: string;
};

export type IStatsByStoreResponse = {
  success: boolean;
  data: {
    stores: IStoreStatsItem[];
    totalStores: number;
  };
};

// ============================================================================
// TOP PRODUCTS - Produits les plus vendus
// ============================================================================

export type ITopProductItem = {
  _id: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
};

export type ITopProductsResponse = {
  success: boolean;
  data: {
    topProducts: ITopProductItem[];
    period: string;
    storesCount: number;
  };
};

export type ITopProductsParams = {
  limit?: number;
};

// ============================================================================
// SALES TRENDS - Tendances de ventes quotidiennes
// ============================================================================

export type IDailySalesTrendItem = {
  _id: {
    year: number;
    month: number;
    day: number;
  };
  totalSales: number;
  orderCount: number;
};

export type ISalesTrendsResponse = {
  success: boolean;
  data: {
    dailySales: IDailySalesTrendItem[];
    period: string;
    currency: string;
    storesCount: number;
  };
};

export type ISalesTrendsParams = {
  days?: number;
};

// ============================================================================
// DASHBOARD OVERVIEW - Vue d'ensemble complète
// ============================================================================

export type IDashboardOverview = {
  dailyStats: IDailyStatsResponse['data'];
  salesByProduct: ISalesByProductResponse['data'];
  salesByMonth: ISalesByMonthResponse['data'];
  statsByStore: IStatsByStoreResponse['data'];
  topProducts: ITopProductsResponse['data'];
  salesTrends: ISalesTrendsResponse['data'];
};

// ============================================================================
// FILTRES ET PARAMÈTRES COMMUNS
// ============================================================================

export type IDashboardFilters = {
  storeId?: string | null;
  period?: 'today' | 'week' | 'month' | 'year';
  startDate?: Date | string | null;
  endDate?: Date | string | null;
};

export type IDashboardDateRange = {
  start: Date;
  end: Date;
  label: string;
};

// ============================================================================
// ÉTAT REDUX
// ============================================================================

export type IOwnerDashboardState = {
  // Données
  dailyStats: IDailyStatsResponse['data'] | null;
  salesByProduct: ISalesByProductResponse['data'] | null;
  salesByMonth: ISalesByMonthResponse['data'] | null;
  statsByStore: IStatsByStoreResponse['data'] | null;
  topProducts: ITopProductsResponse['data'] | null;
  salesTrends: ISalesTrendsResponse['data'] | null;
  
  // États de chargement
  isLoading: {
    dailyStats: boolean;
    salesByProduct: boolean;
    salesByMonth: boolean;
    statsByStore: boolean;
    topProducts: boolean;
    salesTrends: boolean;
  };
  
  // Erreurs
  error: string | null;
  
  // Filtres actifs
  filters: IDashboardFilters;
  
  // Dernière mise à jour
  lastUpdated: Date | null;
};
// src/types/report.ts

export type ReportPeriod = 'today' | 'week' | 'month' | 'year' | 'custom';

// Interface pour les filtres de rapport
export interface IReportFilters {
  startDate: Date | null;
  endDate: Date | null;
  period: ReportPeriod;
  storeId?: string;
}

export type IReportFilterValue = string | Date | null | ReportPeriod;

// Interface pour les informations de magasin dans les rapports
export interface IStoreReportInfo {
  _id: string;
  revenue: number;
  orders: number;
  storeInfo: Array<{
    _id: string;
    name: string;
    contact?: {
      phone: string;
      address: {
        city: string;
        country: string;
      };
    };
  }>;
}

// Interface pour les produits les plus vendus
export interface ITopProduct {
  _id: string;
  totalSold: number;
  revenue: number;
  productInfo: Array<{
    _id: string;
    name: string;
    price: number;
    category_id?: {
      name: string;
    };
  }>;
}

// Interface pour le rapport général du propriétaire
export interface IOwnerOverview {
  totalRevenue: number;
  totalOrders: number;
  stores: IStoreReportInfo[];
  period: string;
}

// Interface pour le rapport détaillé d'un magasin
export interface IStoreReport {
  store: string;
  period: string;
  revenue: number;
  orders: number;
  averageOrder: number;
  topProducts: ITopProduct[];
}

// Réponses API
export interface OwnerOverviewResponse {
  success: boolean;
  data: IOwnerOverview;
}

export interface StoreReportResponse {
  success: boolean;
  data: IStoreReport;
}

// Interface pour les paramètres de requête
export interface ReportQueryParams {
  startDate: string;
  endDate: string;
}

// Interface pour les métriques calculées côté frontend
export interface IReportMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topStore?: {
    name: string;
    revenue: number;
  };
  growth?: {
    revenue: number;
    orders: number;
  };
}

// Interface pour les données de graphique
export interface IChartData {
  name: string;
  value: number;
  color?: string;
}

// Types pour les filtres de la vue
export interface IReportTableFilters {
  period: ReportPeriod;
  startDate: Date | null;
  endDate: Date | null;
  storeId: string;
}

// Interface pour les actions de mise à jour des filtres
export interface IReportFiltersAction {
  type: 'SET_PERIOD' | 'SET_DATES' | 'SET_STORE' | 'RESET';
  payload?: any;
}

// Helpers pour les périodes prédéfinies
export const REPORT_PERIODS = {
  today: 'Aujourd\'hui',
  week: 'Cette semaine',
  month: 'Ce mois',
  year: 'Cette année',
  custom: 'Période personnalisée'
} as const;

// Fonction helper pour calculer les dates selon la période
// Fonction helper pour calculer les dates selon la période
export const getDateRangeFromPeriod = (period: ReportPeriod): { startDate: Date; endDate: Date } => {
  const now = new Date();
  let endDate = new Date(now);
  let startDate = new Date(now);

  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate = new Date(now.getFullYear(), now.getMonth(), diff); // Créer une nouvelle instance
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      // Pour 'custom', retourner les 30 derniers jours par défaut
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
  }

  return { startDate, endDate };
};
// Type guards
export const isOwnerOverview = (data: any): data is IOwnerOverview => {
  return data && typeof data.totalRevenue === 'number' && Array.isArray(data.stores);
};

export const isStoreReport = (data: any): data is IStoreReport => {
  return data && typeof data.revenue === 'number' && Array.isArray(data.topProducts);
};

// Formatters pour l'affichage
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'HTG', // ou la devise de votre choix
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatPeriod = (startDate: Date, endDate: Date): string => {
  const start = startDate.toLocaleDateString('fr-FR');
  const end = endDate.toLocaleDateString('fr-FR');
  return `${start} - ${end}`;
};
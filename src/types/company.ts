// ----------------------------------------------------------------------
// Filtres pour les tables/requêtes de Company
export type ICompanyTableFilterValue = string | string[] | Date | null;

export type ICompanyTableFilters = {
  name: string;
  status: string[];
  createdAfter: Date | null;
  createdBefore: Date | null;
};

// ----------------------------------------------------------------------

// Historique des modifications
export type ICompanyHistory = {
  createdAt: Date | string | number;
  updatedAt: Date | string | number;
  events: {
    type: 'creation' | 'update' | 'deactivation' | 'reactivation';
    by: string; // Nom ou ID de l'utilisateur
    at: Date | string | number;
    changes?: Record<string, { old: any; new: any }>;
  }[];
};

// Paramètres financiers
export type ICompanyFinancialSettings = {
  currency: 'HTG' | 'USD' | 'EUR';
  taxRate: number;
};

// Références aux utilisateurs
export type ICompanyUserReferences = {
  ownerId: string;
  createdBy: string;
  updatedBy?: string;
  deletedBy?: string;
};

// Statut de l'entreprise
export type ICompanyStatus = {
  isActive: boolean;
  deletedAt?: Date | string | number;
  activationHistory: {
    status: boolean;
    changedAt: Date | string | number;
    changedBy: string;
  }[];
};

// Type principal Company
export type ICompanyItem = {
  id: string;
  name: string;
  refCode: string;
  settings: ICompanyFinancialSettings;
  status: ICompanyStatus;
  history: ICompanyHistory;
  users: ICompanyUserReferences;
  metadata: {
    storeCount: number;
    employeeCount: number;
    productCount: number;
  };
  createdAt: Date | string | number;
  updatedAt: Date | string | number;
};

// Type pour les relations embarquées (si nécessaire)
export type ICompanyEmbedded = {
  id: string;
  name: string;
  refCode: string;
  isActive: boolean;
};
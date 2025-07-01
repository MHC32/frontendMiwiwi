// src/types/employee.ts

export type EmployeeRole = 'cashier' | 'supervisor';
export type EmployeeStatusFilter = 'active' | 'inactive' | 'all';
export type EmployeeRoleFilter = 'cashier' | 'supervisor' | 'all';

// Interfaces pour les entités liées
export interface ICompany {
  _id: string;
  name: string;
  ref_code: string;
}

export interface IStoreContact {
  phone: string;
  address: {
    city: string;
    country: string;
  };
}

export interface IStore {
  _id: string;
  name: string;
  contact: IStoreContact;
  company_id: ICompany;
}

export interface ICreatedBy {
  _id: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface IAssignedStore {
  storeId: string;
  role: 'employee' | 'supervisor';
}

// Interface de base pour les employés
export interface IEmployeeBase {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  role: EmployeeRole;
  pin_code: number | string;
  is_active: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: ICreatedBy;
  // Nouvelles propriétés enrichies
  stores: IStore[];
  supervisedStore?: IStore;
  assignedStores: IAssignedStore[];
  totalStoresAssigned: number;
}

// Interface principale Employee (remplace l'ancienne IEmployee)
export interface IEmployee extends IEmployeeBase {
  // Cette interface englobe maintenant tous les types d'employés
  // avec les informations enrichies du backend
}

// Types différenciés pour plus de sécurité de type
export type Cashier = IEmployee & {
  role: 'cashier';
  stores: IStore[]; // Au moins un store assigné
  assignedStores: IAssignedStore[]; // Rôle 'employee'
};

export type Supervisor = IEmployee & {
  role: 'supervisor';
  supervisedStore: IStore; // Store supervisé obligatoire
  assignedStores: IAssignedStore[]; // Rôle 'supervisor'
};

// Union type pour les employés
export type Employee = Cashier | Supervisor;

// Pour les formulaires (inchangé car c'est pour la création/modification)
export type EmployeeFormValues = {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  role: EmployeeRole;
  store_id?: string; // Pour cashier
  supervised_store_id?: string; // Pour supervisor
  pin_code?: string;
  is_active?: boolean;
  password?: string;
};

// Métadonnées de réponse du backend
export interface IEmployeeListMeta {
  totalCompanies: number;
  totalStores: number;
  storeFilter?: string;
}

// Pour les réponses API enrichies
export type EmployeeListResponse = {
  success: boolean;
  data: Employee[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  meta: IEmployeeListMeta;
};

// Interface pour les filtres de table
export interface IEmployeeTableFilters {
  is_active: EmployeeStatusFilter;
  name: string;
  role: EmployeeRoleFilter;
  store_id: string[];
  query?: string; // Optionnel: pour la recherche globale
}

export type IEmployeeTableFilterValue =
  | string
  | string[]
  | EmployeeStatusFilter
  | EmployeeRoleFilter;

// Pour les paramètres de requête API
export type EmployeeQueryParams = {
  page?: number;
  limit?: number;
  role?: EmployeeRole;
  is_active?: boolean;
  storeId?: string; // Attention: changé de store_id à storeId pour correspondre au backend
  query?: string;
};

// Helpers pour vérifier les types
export const isCashier = (employee: Employee): employee is Cashier => {
  return employee.role === 'cashier';
};

export const isSupervisor = (employee: Employee): employee is Supervisor => {
  return employee.role === 'supervisor';
};

// Helpers pour extraire les informations des stores
export const getEmployeeStores = (employee: Employee): IStore[] => {
  if (isCashier(employee)) {
    return employee.stores;
  } else if (isSupervisor(employee) && employee.supervisedStore) {
    return [employee.supervisedStore];
  }
  return [];
};

export const getEmployeeStoreNames = (employee: Employee): string[] => {
  return getEmployeeStores(employee).map(store => store.name);
};

export const getEmployeeCompanies = (employee: Employee): ICompany[] => {
  const stores = getEmployeeStores(employee);
  const companies = stores.map(store => store.company_id);
  // Supprimer les doublons par _id
  return companies.filter((company, index, self) => 
    index === self.findIndex(c => c._id === company._id)
  );
};

// Types pour les actions de mise à jour de statut
export interface IEmployeeStatusUpdate {
  id: string;
  is_active: boolean;
}

// Type pour les détails complets d'un employé
export type EmployeeDetailsResponse = {
  success: boolean;
  data: Employee;
};
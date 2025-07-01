export type EmployeeRole = 'cashier' | 'supervisor';
export type EmployeeStatusFilter = 'active' | 'inactive' | 'all';
export type EmployeeRoleFilter = 'cashier' | 'supervisor' | 'all';

export interface IEmployeeBase {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  role: EmployeeRole;
  pin_code: string; 
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}
export interface IEmployee extends IEmployeeBase {
  // Pour les cashiers
  store_id?: string; // ID du magasin assigné
  
  // Pour les supervisors
  supervised_store_id?: string; // ID du magasin supervisé
  
  created_by?: string; // ID créateur
}

// Types différenciés pour plus de sécurité
export type Cashier = IEmployee & {
  role: 'cashier';
  store_id: string; // Obligatoire pour les caissiers
};

export type Supervisor = IEmployee & {
  role: 'supervisor';
  supervised_store_id: string; // Obligatoire pour les superviseurs
};

// Pour les formulaires
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

// Pour les réponses API
export type EmployeeListResponse = {
  data: Array<Cashier | Supervisor>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};


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
  store_id?: string;
  query?: string;
};
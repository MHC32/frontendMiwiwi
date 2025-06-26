export type StoreEmployee = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
};

export type StoreContact = {
  phone: string;
  address: {
    city: string;
    country: string;
  };
};

export type IStoreItem = {
  id: string;
  name: string;
  contact: StoreContact;
  company_id: string;
  supervisor_id: string | null;
  employees: StoreEmployee[];
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
};

export type IStoreTableFilterValue = string | string[];

export type IStoreTableFilters = {
  name: string;
  city: string[];
  status: string;
};

export type StoreFormValues = {
  name: string;
  contact: {
    phone: string;
    address: {
      city: string;
      country: string;
    };
  };
  supervisor_id?: string;
};

export type StoreListResponse = {
  data: IStoreItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
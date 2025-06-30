import axios from 'src/utils/axios';
import type { ICompanyItem } from 'src/types/company';
import type { IStoreItem, StoreFormValues, StoreListResponse } from 'src/types/store';
import type { EmployeeRole,Cashier, Supervisor, EmployeeFormValues, EmployeeListResponse } from 'src/types/employee';

type LoginCredentials = {
  phone: string;
  password: string;
};

type UserResponse = {
  userId: string;
  role: string;
  phone?: string;
  companyId?: string;
};

type Company = {
  id: string;
  name: string;
  ref_code: string;
  settings: {
    currency: string;
    tax_rate: number;
  };
  is_active: boolean;
};

type StoreEmployee = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
};

type Store = {
  id: string;
  name: string;
  contact: {
    phone: string;
    address: {
      city: string;
      country: string;
    };
  };
  is_active: boolean;
  employees?: StoreEmployee[];
};
export type OwnerProfileResponse = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    role: string;
  };
  companies: Company[];
  stores: Store[];
  supervisedStore: Store | null;
}; 

export const authRequests = {
  loginOwner: async (credentials: LoginCredentials): Promise<UserResponse> => {
    const response = await axios.post('/api/user/login-owner', credentials);
    if (!response.data.userId) throw new Error('Invalid response format');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axios.get('/api/user/logout');
  },

 
  getOwnerData: async (): Promise<OwnerProfileResponse> => {
    const response = await axios.get('/api/user/owner-data');
    return response.data;
  },
};

export const companyRequests = {
  // Création d'entreprise (seulement pour owner sans entreprise existante)
  createCompany: async (companyData: Omit<ICompanyItem, 'id'>): Promise<{ id: string; ref_code: string }> => {
    const response = await axios.post('/api/company/my-company', companyData);
    return response.data;
  },

  // Récupération de l'entreprise du owner (lecture seule)
  getMyCompany: async (): Promise<ICompanyItem | null> => {
    try {
      const response = await axios.get('/api/owner/my-companies');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },



};

export const userRequests = {
  getProfile: async (): Promise<{
    id: string;
    phone: string;
    first_name: string;
    last_name: string;
    role: string;
    company?: {
      id: string;
      name: string;
      ref_code: string;
    };
  }> => {
    const response = await axios.get('/api/user/profile');
    return response.data;
  },

  updateProfile: async (data: {
    first_name?: string;
    last_name?: string;
    email?: string;
  }): Promise<void> => {
    await axios.patch('/api/user/profile', data);
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await axios.patch('/api/user/change-password', data);
  }
};

// Helper pour les erreurs API
export const handleApiError = (error: any) => {
  if (error.response) {
    const message = error.response.data?.message || 'Erreur serveur';
    const status = error.response.status;
    return { message, status };
  }
  return { message: 'Erreur réseau', status: 0 };
};


export const storeRequests = {
  createStore: async (storeData: StoreFormValues): Promise<IStoreItem> => {
    const formData = new FormData();
    
    // Champs obligatoires
    formData.append('name', storeData.name);
    formData.append('contact[phone]', storeData.contact.phone);
    formData.append('contact[address][city]', storeData.contact.address.city);
    formData.append('contact[address][country]', storeData.contact.address.country || 'Haïti');
    formData.append('is_active', String(storeData.is_active ?? true));

    
    // Gestion de la photo
    if (storeData.photo instanceof File) {
      formData.append('photo', storeData.photo);
    }

    const response = await axios.post('/api/owner/stores', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateStore: async (id: string, storeData: Partial<StoreFormValues>): Promise<IStoreItem> => {
    const formData = new FormData();
    
    // Champs modifiables
    if (storeData.name) formData.append('name', storeData.name);
    if (storeData.contact?.phone) formData.append('contact[phone]', storeData.contact.phone);
    if (storeData.contact?.address?.city) formData.append('contact[address][city]', storeData.contact.address.city);
    if (storeData.contact?.address?.country) {
      formData.append('contact[address][country]', storeData.contact.address.country);
    }
    
    if (storeData.supervisor_id) {
      formData.append('supervisor_id', storeData.supervisor_id);
    }
    
    // Gestion de la photo
    if (storeData.photo instanceof File) {
      formData.append('photo', storeData.photo);
    }

    const response = await axios.patch(`/api/owner/stores/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getStores: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<StoreListResponse> => {
    const response = await axios.get('/api/owner/stores', { params });
    return response.data;
  },

  getStoreDetails: async (id: string): Promise<IStoreItem> => {
    const response = await axios.get(`/api/owner/stores/${id}`);
    return response.data;
  },

  deleteStore: async (id: string): Promise<void> => {
    await axios.delete(`/api/owner/stores/${id}`);
  },

  activateStore: async (id: string): Promise<IStoreItem> => {
    const response = await axios.patch(`/api/owner/stores/${id}/activate`);
    return response.data;
  },

  deactivateStore: async (id: string): Promise<IStoreItem> => {
    const response = await axios.patch(`/api/owner/stores/${id}/deactivate`);
    return response.data;
  },
};




export const employeeRequests = {
  // Créer un nouvel employé (cashier ou supervisor)
  createEmployee: async (employeeData: EmployeeFormValues): Promise<Cashier | Supervisor> => {
    const formData = new FormData();
    
    // Champs obligatoires
    formData.append('first_name', employeeData.first_name);
    formData.append('last_name', employeeData.last_name);
    formData.append('phone', employeeData.phone);
    formData.append('role', employeeData.role);
    formData.append('password', employeeData.password || ''); // Mot de passe temporaire
    
    // Champs conditionnels
    if (employeeData.email) formData.append('email', employeeData.email);
    if (employeeData.pin_code) formData.append('pin_code', employeeData.pin_code);
    
    // Gestion spécifique au rôle
    if (employeeData.role === 'cashier' && employeeData.store_id) {
      formData.append('storeIds[]', employeeData.store_id);
    } else if (employeeData.role === 'supervisor' && employeeData.supervised_store_id) {
      formData.append('storeIds[]', employeeData.supervised_store_id);
    }

    const response = await axios.post('/api/owner/employees', formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // Mettre à jour un employé existant
  updateEmployee: async (id: string, employeeData: Partial<EmployeeFormValues>): Promise<Cashier | Supervisor> => {
    const formData = new FormData();
    
    // Champs modifiables
    if (employeeData.first_name) formData.append('first_name', employeeData.first_name);
    if (employeeData.last_name) formData.append('last_name', employeeData.last_name);
    if (employeeData.phone) formData.append('phone', employeeData.phone);
    if (employeeData.email) formData.append('email', employeeData.email);
    if (employeeData.role) formData.append('role', employeeData.role);
    if (employeeData.pin_code) formData.append('pin_code', employeeData.pin_code);
    
    // Gestion spécifique au rôle
    if (employeeData.role === 'cashier' && employeeData.store_id) {
      formData.append('storeIds[]', employeeData.store_id);
    } else if (employeeData.role === 'supervisor' && employeeData.supervised_store_id) {
      formData.append('storeIds[]', employeeData.supervised_store_id);
    }

    const response = await axios.patch(`/api/owner/employees/${id}`, formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // Lister les employés avec pagination et filtres
  getEmployees: async (params?: {
    page?: number;
    limit?: number;
    storeId?: string;
    role?: EmployeeRole;
    is_active?: boolean;
  }): Promise<EmployeeListResponse> => {
    const response = await axios.get('/api/owner/employees', { params });
    return response.data;
  },

  // Obtenir les détails d'un employé spécifique
  getEmployeeDetails: async (id: string): Promise<Cashier | Supervisor> => {
    const response = await axios.get(`/api/owner/employees/${id}`);
    return response.data;
  },

  // Activer/désactiver un employé
 toggleEmployeeStatus: async (id: string, activate: boolean): Promise<Cashier | Supervisor> => {
  const endpoint = activate ? 'activate' : 'deactivate';
  const response = await axios.patch(`/api/owner/employees/${id}/${endpoint}`);
  return response.data; // Retourne l'employé mis à jour
},

  // Supprimer un employé
  deleteEmployee: async (id: string): Promise<void> => {
    await axios.delete(`/api/owner/employees/${id}`);
  }
};
import axios from 'src/utils/axios';
import type { ICompanyItem } from 'src/types/company';
import type { IStoreItem, StoreFormValues, StoreListResponse } from 'src/types/store';

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
    const response = await axios.post('/api/stores', storeData);
    return response.data;
  },

  updateStore: async (id: string, storeData: Partial<StoreFormValues>): Promise<IStoreItem> => {
    const response = await axios.patch(`/api/owner/stores/${id}`, storeData);
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

  deleteStore: async (id: string): Promise<{ success: boolean }> => {
    const response = await axios.delete(`/api/owner/stores/${id}`);
    return response.data;
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
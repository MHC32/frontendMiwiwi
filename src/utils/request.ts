import axios from 'src/utils/axios';
import type { ICompanyItem } from 'src/types/company';
import type { IStoreItem, StoreFormValues, StoreListResponse } from 'src/types/store';
import type { EmployeeRole, Cashier, Supervisor, EmployeeFormValues, EmployeeListResponse } from 'src/types/employee';
import type { ICategory, ICategoryFormValues, CategoryListResponse, CategoryResponse } from 'src/types/category';
import type { IProductItem, ProductListResponse } from 'src/types/product';
import type { IMeterReadingItem, IMeterReadingFilters, IVerifyReadingPayload } from 'src/types/meter-reading';
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




// Interface pour la réponse de la liste des relevés
export interface MeterReadingListResponse {
  success: boolean;
  data: IMeterReadingItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Interface pour la réponse de vérification
export interface VerifyReadingResponse {
  success: boolean;
  data: {
    id: string;
    status: string;
    verified_by: {
      id: string;
      name: string;
    };
    verified_at: string;
  };
}





// Interface pour les paramètres de requête des catégories
interface CategoryQueryParams {
  storeId?: string;
  withProducts?: boolean;
  parentId?: string | null;
  is_active?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}


export const authRequests = {
  loginOwner: async (credentials: LoginCredentials): Promise<UserResponse> => {
    const response = await axios.post('/api/user/login-owner', credentials);
    if (!response.data.userId) throw new Error('Invalid response format');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axios.post('/api/user/logout');
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


export const categoryRequests = {
  // Créer une nouvelle catégorie
  createCategory: async (categoryData: ICategoryFormValues): Promise<ICategory> => {
    const payload = {
      name: categoryData.name,
      parent_id: categoryData.parent_id || null,
      color: categoryData.color || '#4CAF50',
      icon: categoryData.icon || 'other',
      storeIds: categoryData.storeIds || [],
    };

    const response = await axios.post('/api/owner/categories', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.data.data; // Backend retourne { success: true, data: category }
  },

  // Mettre à jour une catégorie existante
  updateCategory: async (id: string, categoryData: Partial<ICategoryFormValues>): Promise<ICategory> => {
    const payload: any = {};
    
    // Champs modifiables
    if (categoryData.name) payload.name = categoryData.name;
    if (categoryData.color) payload.color = categoryData.color;
    if (categoryData.icon) payload.icon = categoryData.icon;
    
    // Gestion des stores à ajouter
    if (categoryData.storeIds && categoryData.storeIds.length > 0) {
      payload.storeIds = categoryData.storeIds;
    }
    
    // Gestion des stores à retirer (nouvelle fonctionnalité du backend)
    if (categoryData.storeRemove && categoryData.storeRemove.length > 0) {
      payload.storeRemove = categoryData.storeRemove;
    }

    const response = await axios.patch(`/api/categories/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.data.data;
  },

  // Lister les catégories avec filtres
  getCategories: async (params?: CategoryQueryParams): Promise<CategoryListResponse> => {
    const queryParams: any = {};
    
    if (params?.storeId) queryParams.storeId = params.storeId;
    if (params?.withProducts !== undefined) queryParams.withProducts = params.withProducts;
    if (params?.parentId !== undefined) queryParams.parentId = params.parentId;
    if (params?.is_active !== undefined) queryParams.is_active = params.is_active;
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.search) queryParams.search = params.search;

    const response = await axios.get('/api/owner/categories', { params: queryParams });
    
    return {
      success: response.data.success,
      data: response.data.data,
      meta: response.data.meta
    };
  },

  // Obtenir les détails d'une catégorie spécifique
  getCategoryDetails: async (id: string): Promise<ICategory> => {
    const response = await axios.get(`/api/owner/categories/${id}`);
    return response.data.data;
  },

  // Désactiver une catégorie
  deactivateCategory: async (id: string): Promise<ICategory> => {
    const response = await axios.patch(`/api/owner/categories/${id}/deactivate`);
    return response.data.data;
  },

  // Réactiver une catégorie
  reactivateCategory: async (id: string): Promise<ICategory> => {
    const response = await axios.patch(`/api/owner/categories/${id}/reactivate`);
    return response.data.data;
  },

  // Supprimer définitivement une catégorie (si implémenté côté backend)
  deleteCategory: async (id: string): Promise<void> => {
    await axios.delete(`/api/owner/categories/${id}`);
  },

  // Actions spécialisées pour les relations avec les stores
  
  // Ajouter des stores à une catégorie
  addStoresToCategory: async (categoryId: string, storeIds: string[]): Promise<ICategory> => {
    const response = await axios.patch(`/api/owner/categories/${categoryId}`, {
      storeIds
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data.data;
  },

  // Retirer des stores d'une catégorie
  removeStoresFromCategory: async (categoryId: string, storeIds: string[]): Promise<ICategory> => {
    const response = await axios.patch(`/api/owner/categories/${categoryId}`, {
      storeRemove: storeIds
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data.data;
  },

  // Obtenir toutes les catégories d'un store spécifique
  getCategoriesByStore: async (storeId: string): Promise<CategoryListResponse> => {
    return categoryRequests.getCategories({ storeId });
  },

  // Obtenir l'arbre hiérarchique des catégories
  getCategoryTree: async (storeId?: string): Promise<CategoryListResponse> => {
    return categoryRequests.getCategories({ 
      storeId, 
      is_active: true 
    });
  },

  // Obtenir les catégories racines (sans parent)
  getRootCategories: async (storeId?: string): Promise<CategoryListResponse> => {
    return categoryRequests.getCategories({ 
      storeId,
      parentId: null,
      is_active: true
    });
  },

  // Obtenir les sous-catégories d'une catégorie parent
  getChildCategories: async (parentId: string, storeId?: string): Promise<CategoryListResponse> => {
    return categoryRequests.getCategories({ 
      parentId,
      storeId,
      is_active: true
    });
  },

  // Rechercher des catégories par nom
  searchCategories: async (searchTerm: string, storeId?: string): Promise<CategoryListResponse> => {
    return categoryRequests.getCategories({ 
      search: searchTerm,
      storeId
    });
  },

  // Obtenir les catégories avec leurs produits
  getCategoriesWithProducts: async (storeId?: string): Promise<CategoryListResponse> => {
    return categoryRequests.getCategories({ 
      storeId,
      withProducts: true,
      is_active: true
    });
  },

  // Statistiques et métriques
  
  // Obtenir le nombre total de catégories
  getCategoryCount: async (): Promise<{ total: number; active: number; inactive: number }> => {
    const [allCategories, activeCategories] = await Promise.all([
      categoryRequests.getCategories(),
      categoryRequests.getCategories({ is_active: true })
    ]);
    
    return {
      total: allCategories.data.length,
      active: activeCategories.data.length,
      inactive: allCategories.data.length - activeCategories.data.length
    };
  },

  // Vérifier si une catégorie peut être supprimée (pas d'enfants actifs)
  canDeleteCategory: async (categoryId: string): Promise<boolean> => {
    try {
      const children = await categoryRequests.getChildCategories(categoryId);
      return children.data.length === 0;
    } catch (error) {
      return false;
    }
  },

  // Obtenir le chemin complet d'une catégorie (breadcrumb)
  getCategoryPath: async (categoryId: string): Promise<ICategory[]> => {
    const category = await categoryRequests.getCategoryDetails(categoryId);
    const path: ICategory[] = [category];
    
    let current = category;
    while (current.parent_id) {
      try {
        const parent = await categoryRequests.getCategoryDetails(current.parent_id);
        path.unshift(parent);
        current = parent;
      } catch (error) {
        break; // Parent non trouvé, arrêter
      }
    }
    
    return path;
  },

  // Validation et helpers
  
  // Vérifier si le nom de catégorie est unique (dans la même entreprise et au même niveau)
  validateCategoryName: async (name: string, parentId?: string | null, excludeId?: string): Promise<boolean> => {
    try {
      const categories = await categoryRequests.getCategories({ parentId });
      const existingCategory = categories.data.find(cat => 
        cat.name.toLowerCase() === name.toLowerCase() && 
        cat._id !== excludeId
      );
      return !existingCategory;
    } catch (error) {
      return false;
    }
  },

  // Valider qu'un parent existe et est valide
  validateParentCategory: async (parentId: string): Promise<boolean> => {
    try {
      const parent = await categoryRequests.getCategoryDetails(parentId);
      return parent.is_active;
    } catch (error) {
      return false;
    }
  }
};


export const productRequests = {
  // Créer un nouveau produit
  createProduct: async (productData: FormData): Promise<IProductItem> => {
    const response = await axios.post('/api/owner/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Obtenir tous les produits
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    storeId?: string;
    categoryId?: string;
    type?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ProductListResponse> => {
    const response = await axios.get('/api/owner/products', { params });
    return response.data;
  },

  // Mettre à jour un produit
  updateProduct: async (id: string, productData: FormData): Promise<IProductItem> => {
    const response = await axios.patch(`/api/owner/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getProductById: async (id: string): Promise<IProductItem> => {
    const response = await axios.get(`/api/owner/products/${id}`);
    return response.data.data;
  },


  // Désactiver un produit
  deactivateProduct: async (id: string): Promise<IProductItem> => {
    const response = await axios.delete(`/api/owner/products/${id}`);
    return response.data;
  },

  // Réactiver un produit
  reactivateProduct: async (id: string): Promise<IProductItem> => {
    const response = await axios.patch(`/api/owner/products/${id}/reactivate`);
    return response.data;
  },
};


export const meterReadingRequests = {
  // Obtenir les relevés d'un magasin avec filtres
  getStoreReadings: async (
    storeId: string, 
    filters?: IMeterReadingFilters
  ): Promise<MeterReadingListResponse> => {
    const params: any = {};
    
    if (filters?.date) params.date = filters.date;
    if (filters?.type && filters.type !== 'all') params.type = filters.type;
    if (filters?.status && filters.status !== 'all') params.status = filters.status;

    const response = await axios.get(`/api/owner/stores/${storeId}/readings`, { params });
    return response.data;
  },

  // Vérifier/Valider un relevé (pour superviseurs/owners)
  verifyReading: async (
    id: string, 
    payload: IVerifyReadingPayload
  ): Promise<VerifyReadingResponse> => {
    const response = await axios.patch(`/api/owner/readings/${id}/verify`, payload);
    return response.data;
  },

  // Obtenir les statistiques des relevés pour un magasin
  getReadingStats: async (storeId: string, period?: string): Promise<{
    total: number;
    pending: number;
    verified: number;
    rejected: number;
    byType: Record<string, number>;
  }> => {
    const params = period ? { period } : {};
    const response = await axios.get(`/api/owner/stores/${storeId}/readings/stats`, { params });
    return response.data;
  }
};

// Ajoutez aussi ces endpoints dans API_ENDPOINTS :
export const METER_READING_ENDPOINTS = {
  storeReadings: (storeId: string) => `/api/owner/stores/${storeId}/readings`,
  verifyReading: (id: string) => `/api/owner/readings/${id}/verify`,
  readingStats: (storeId: string) => `/api/owner/stores/${storeId}/readings/stats`,
};
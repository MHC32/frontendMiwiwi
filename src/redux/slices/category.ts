// src/redux/slices/category.slice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch } from 'src/redux/store';
import { categoryRequests } from 'src/utils/request';
import  { 
  ICategory, 
  CategoryListResponse, 
  ICategoryFormValues,
  CategoryState,
  CategoryTreeNode,
  buildCategoryTree,
  getCategoryDescendants
} from '../../types/category';

interface CategoryQueryParams {
  storeId?: string;
  withProducts?: boolean;
  parentId?: string | null;
  is_active?: boolean;
}

const initialState: CategoryState = {
  isLoading: false,
  error: null,
  categories: [],
  currentCategory: null,
  filters: {
    storeId: undefined,
    withProducts: false,
    parentId: undefined,
  },
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getCategoriesSuccess(state, action: PayloadAction<CategoryListResponse>) {
      state.isLoading = false;
      state.categories = action.payload.data;
    },
    getCategoryDetailsSuccess(state, action: PayloadAction<ICategory>) {
      state.isLoading = false;
      state.currentCategory = action.payload;
    },
    createCategorySuccess(state, action: PayloadAction<ICategory>) {
      state.isLoading = false;
      state.categories.unshift(action.payload);
    },
    updateCategorySuccess(state, action: PayloadAction<ICategory>) {
      state.isLoading = false;
      state.categories = state.categories.map(category =>
        category._id === action.payload._id ? action.payload : category
      );
      if (state.currentCategory?._id === action.payload._id) {
        state.currentCategory = action.payload;
      }
    },
    deleteCategorySuccess(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.categories = state.categories.filter(category => category._id !== action.payload);
      if (state.currentCategory?._id === action.payload) {
        state.currentCategory = null;
      }
    },
    toggleCategoryStatusSuccess(state, action: PayloadAction<ICategory>) {
      state.isLoading = false;
      const updatedCategory = action.payload;
      state.categories = state.categories.map(category =>
        category._id === updatedCategory._id ? updatedCategory : category
      );
      if (state.currentCategory?._id === updatedCategory._id) {
        state.currentCategory = updatedCategory;
      }
    },
    setFilters(state, action: PayloadAction<Partial<CategoryState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetCategoryState(state) {
      Object.assign(state, initialState);
    },
    clearError(state) {
      state.error = null;
    },
  },
});

// Export des actions
export const {
  startLoading,
  hasError,
  getCategoriesSuccess,
  getCategoryDetailsSuccess,
  createCategorySuccess,
  updateCategorySuccess,
  deleteCategorySuccess,
  toggleCategoryStatusSuccess,
  setFilters,
  resetCategoryState,
  clearError,
} = categorySlice.actions;

// Thunks (actions asynchrones)
export const fetchCategories = (params?: CategoryQueryParams) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(startLoading());
      const response = await categoryRequests.getCategories(params);
      dispatch(getCategoriesSuccess(response));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      dispatch(hasError(errorMessage));
      throw error;
    }
  };

export const fetchCategoryDetails = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await categoryRequests.getCategoryDetails(id);
    dispatch(getCategoryDetailsSuccess(response));
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    dispatch(hasError(errorMessage));
    throw error;
  }
};

export const createCategory = (data: ICategoryFormValues) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await categoryRequests.createCategory(data);
    dispatch(createCategorySuccess(response));
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    dispatch(hasError(errorMessage));
    throw error;
  }
};

export const updateCategory = (id: string, data: Partial<ICategoryFormValues>) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(startLoading());
      const response = await categoryRequests.updateCategory(id, data);
      dispatch(updateCategorySuccess(response));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      dispatch(hasError(errorMessage));
      throw error;
    }
  };

export const deleteCategory = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    await categoryRequests.deleteCategory(id);
    dispatch(deleteCategorySuccess(id));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    dispatch(hasError(errorMessage));
    throw error;
  }
};

export const activateCategory = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await categoryRequests.reactivateCategory(id);
    dispatch(toggleCategoryStatusSuccess(response));
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    dispatch(hasError(errorMessage));
    throw error;
  }
};

export const deactivateCategory = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await categoryRequests.deactivateCategory(id);
    dispatch(toggleCategoryStatusSuccess(response));
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    dispatch(hasError(errorMessage));
    throw error;
  }
};

export const toggleCategoryStatus = (id: string, currentStatus: boolean) => 
  async (dispatch: AppDispatch) => {
    return currentStatus 
      ? dispatch(deactivateCategory(id))
      : dispatch(activateCategory(id));
  };

// Actions spécifiques aux catégories
export const addStoresToCategory = (categoryId: string, storeIds: string[]) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(startLoading());
      const response = await categoryRequests.updateCategory(categoryId, { storeIds });
      dispatch(updateCategorySuccess(response));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      dispatch(hasError(errorMessage));
      throw error;
    }
  };

export const removeStoresFromCategory = (categoryId: string, storeIds: string[]) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(startLoading());
      const response = await categoryRequests.updateCategory(categoryId, { storeRemove: storeIds });
      dispatch(updateCategorySuccess(response));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      dispatch(hasError(errorMessage));
      throw error;
    }
  };

// Selectors de base
export const selectCategoryState = (state: { category: CategoryState }) => state.category;
export const selectCategories = (state: { category: CategoryState }) => state.category.categories;
export const selectCurrentCategory = (state: { category: CategoryState }) => state.category.currentCategory;
export const selectCategoryLoading = (state: { category: CategoryState }) => state.category.isLoading;
export const selectCategoryError = (state: { category: CategoryState }) => state.category.error;
export const selectCategoryFilters = (state: { category: CategoryState }) => state.category.filters;

// Selectors enrichis
export const selectCategoryById = (id: string) => (state: { category: CategoryState }) => 
  state.category.categories.find(category => category._id === id);

export const selectActiveCategories = (state: { category: CategoryState }) => 
  state.category.categories.filter(category => category.is_active);

export const selectInactiveCategories = (state: { category: CategoryState }) => 
  state.category.categories.filter(category => !category.is_active);

export const selectRootCategories = (state: { category: CategoryState }) => 
  state.category.categories.filter(category => !category.parent_id);

export const selectChildCategories = (parentId: string) => (state: { category: CategoryState }) => 
  state.category.categories.filter(category => category.parent_id === parentId);

export const selectCategoriesByStore = (storeId: string) => (state: { category: CategoryState }) => 
  state.category.categories.filter(category => category.stores.includes(storeId));

// Selector pour l'arbre de catégories
export const selectCategoryTree = (state: { category: CategoryState }): CategoryTreeNode[] => 
  buildCategoryTree(state.category.categories);

export const selectActiveCategoryTree = (state: { category: CategoryState }): CategoryTreeNode[] => 
  buildCategoryTree(state.category.categories.filter(cat => cat.is_active));

// Selector pour obtenir tous les descendants d'une catégorie
export const selectCategoryDescendants = (categoryId: string) => (state: { category: CategoryState }) => 
  getCategoryDescendants(categoryId, state.category.categories);

// Selector pour les catégories avec leurs parents (breadcrumb)
export const selectCategoryWithParents = (categoryId: string) => (state: { category: CategoryState }) => {
  const categories = state.category.categories;
  const category = categories.find(c => c._id === categoryId);
  
  if (!category) return null;
  
  const parents: ICategory[] = [];
  let current = category;
  
  while (current.parent_id) {
    const parent = categories.find(c => c._id === current.parent_id);
    if (!parent) break;
    parents.unshift(parent);
    current = parent;
  }
  
  return {
    category,
    parents,
    breadcrumb: [...parents, category]
  };
};

// Selectors pour les statistiques
export const selectCategoryStats = (state: { category: CategoryState }) => {
  const categories = state.category.categories;
  return {
    total: categories.length,
    active: categories.filter(cat => cat.is_active).length,
    inactive: categories.filter(cat => !cat.is_active).length,
    roots: categories.filter(cat => !cat.parent_id).length,
    children: categories.filter(cat => cat.parent_id).length,
    totalStoresAssigned: categories.reduce((sum, cat) => sum + cat.stores.length, 0),
  };
};

// Selector pour obtenir tous les stores uniques des catégories
export const selectUniqueStoresFromCategories = (state: { category: CategoryState }) => {
  const allStoreIds = state.category.categories.flatMap(cat => cat.stores);
  return Array.from(new Set(allStoreIds)); // Supprimer les doublons
};

// Selector pour les catégories filtrées
export const selectFilteredCategories = (state: { category: CategoryState }) => {
  const { categories, filters } = state.category;
  let filtered = categories;
  
  if (filters.storeId) {
    filtered = filtered.filter((cat: ICategory) => cat.stores.includes(filters.storeId!));
  }
  
  if (filters.parentId !== undefined) {
    filtered = filtered.filter((cat: ICategory) => cat.parent_id === filters.parentId);
  }
  
  return filtered;
};

export default categorySlice.reducer;
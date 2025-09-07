import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// types
import { IProductItem, ProductListResponse } from 'src/types/product';
// utils
import { productRequests } from 'src/utils/request';
import type { AppDispatch } from '../store';

// ----------------------------------------------------------------------

type ProductState = {
  products: IProductItem[];
  currentProduct: IProductItem | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

// ----------------------------------------------------------------------

const slice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    // Loading states
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },

    stopLoading(state) {
      state.isLoading = false;
    },

    hasError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Products list
    getProductsSuccess(state, action: PayloadAction<ProductListResponse>) {
      state.isLoading = false;
      state.products = action.payload.data;
      state.pagination = action.payload.pagination;
      state.error = null;
    },

    // Single product
    getProductSuccess(state, action: PayloadAction<IProductItem>) {
      state.isLoading = false;
      state.currentProduct = action.payload;
      state.error = null;
    },

    // Create product
    createProductSuccess(state, action: PayloadAction<IProductItem>) {
      state.isLoading = false;
      state.products.unshift(action.payload);
      state.pagination.total += 1;
      state.error = null;
    },

    // Update product
    updateProductSuccess(state, action: PayloadAction<IProductItem>) {
      state.isLoading = false;
      const index = state.products.findIndex(product => product._id === action.payload._id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
      if (state.currentProduct?._id === action.payload._id) {
        state.currentProduct = action.payload;
      }
      state.error = null;
    },

    // Toggle status
    toggleProductStatusSuccess(state, action: PayloadAction<IProductItem>) {
      state.isLoading = false;
      const index = state.products.findIndex(product => product._id === action.payload._id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
      if (state.currentProduct?._id === action.payload._id) {
        state.currentProduct = action.payload;
      }
      state.error = null;
    },

    // Delete product (soft delete)
    deleteProductSuccess(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.products = state.products.filter(product => product._id !== action.payload);
      state.pagination.total -= 1;
      if (state.currentProduct?._id === action.payload) {
        state.currentProduct = null;
      }
      state.error = null;
    },

    // Clear current product
    clearCurrentProduct(state) {
      state.currentProduct = null;
    },

    // Reset state
    resetProducts(state) {
      Object.assign(state, initialState);
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  startLoading,
  stopLoading,
  hasError,
  getProductsSuccess,
  getProductSuccess,
  createProductSuccess,
  updateProductSuccess,
  toggleProductStatusSuccess,
  deleteProductSuccess,
  clearCurrentProduct,
  resetProducts,
} = slice.actions;

// ----------------------------------------------------------------------

// Async Actions (Thunks)

export const getProducts = (params?: {
  page?: number;
  limit?: number;
  storeId?: string;
  categoryId?: string;
  type?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await productRequests.getProducts(params);
    dispatch(getProductsSuccess(response));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    dispatch(hasError(errorMessage));
    throw error;
  }
};

export const getProduct = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await productRequests.getProducts({ search: id }); // Adapter selon votre API
    if (response.data.length > 0) {
      dispatch(getProductSuccess(response.data[0]));
    } else {
      throw new Error('Produit non trouvé');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    dispatch(hasError(errorMessage));
    throw error;
  }
};

export const createProduct = (productData: FormData) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await productRequests.createProduct(productData);
    dispatch(createProductSuccess(response));
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    dispatch(hasError(errorMessage));
    throw error;
  }
};

export const updateProduct = ({ id, data }: { id: string; data: FormData }) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(startLoading());
      const response = await productRequests.updateProduct(id, data);
      dispatch(updateProductSuccess(response));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      dispatch(hasError(errorMessage));
      throw error;
    }
  };

export const getProductById = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await productRequests.getProductById(id);
    dispatch(getProductSuccess(response));
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    dispatch(hasError(errorMessage));
    throw error;
  }
};

export const deactivateProduct = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    await productRequests.deactivateProduct(id);
    dispatch(deleteProductSuccess(id));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    dispatch(hasError(errorMessage));
    throw error;
  }
};

export const activateProduct = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await productRequests.reactivateProduct(id);
    dispatch(updateProductSuccess(response));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    dispatch(hasError(errorMessage));
    throw error;
  }
};

export const toggleProductStatus = (id: string, currentStatus: boolean) => 
  async (dispatch: AppDispatch) => {
    return currentStatus 
      ? dispatch(deactivateProduct(id))
      : dispatch(activateProduct(id));
  };

// Selectors
export const selectProductState = (state: { product: ProductState }) => state.product;
export const selectProducts = (state: { product: ProductState }) => state.product.products;
export const selectCurrentProduct = (state: { product: ProductState }) => state.product.currentProduct;
export const selectProductLoading = (state: { product: ProductState }) => state.product.isLoading;
export const selectProductError = (state: { product: ProductState }) => state.product.error;
export const selectProductPagination = (state: { product: ProductState }) => state.product.pagination;

// Selectors enrichis
export const selectProductById = (id: string) => (state: { product: ProductState }) => 
  state.product.products.find(product => product._id === id);

export const selectProductsByStore = (storeId: string) => (state: { product: ProductState }) => 
  state.product.products.filter(product => product.store_id._id === storeId);

export const selectProductsByCategory = (categoryId: string) => (state: { product: ProductState }) => 
  state.product.products.filter(product => product.category_id?._id === categoryId);

export const selectProductsByType = (type: string) => (state: { product: ProductState }) => 
  state.product.products.filter(product => product.type === type);

export const selectActiveProducts = (state: { product: ProductState }) => 
  state.product.products.filter(product => product.is_active);

export const selectInactiveProducts = (state: { product: ProductState }) => 
  state.product.products.filter(product => !product.is_active);

export const selectLowStockProducts = (state: { product: ProductState }) => 
  state.product.products.filter(product => 
    product.inventory.current <= product.inventory.min_stock
  );
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch } from 'src/redux/store';
import { storeRequests } from 'src/utils/request';
import type { IStoreItem, StoreListResponse, StoreFormValues } from 'src/types/store';

interface StoreState {
  isLoading: boolean;
  error: string | null;
  stores: IStoreItem[];
  currentStore: IStoreItem | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: StoreState = {
  isLoading: false,
  error: null,
  stores: [],
  currentStore: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

const storeSlice = createSlice({
  name: 'store',
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
    getStoresSuccess(state, action: PayloadAction<StoreListResponse>) {
      state.isLoading = false;
      state.stores = action.payload.data;
      state.pagination = action.payload.pagination;
    },
    getStoreDetailsSuccess(state, action: PayloadAction<IStoreItem>) {
      state.isLoading = false;
      state.currentStore = action.payload;
    },
    createStoreSuccess(state, action: PayloadAction<IStoreItem>) {
      state.isLoading = false;
      state.stores.unshift(action.payload);
      state.pagination.total += 1;
    },
    updateStoreSuccess(state, action: PayloadAction<IStoreItem>) {
      state.isLoading = false;
      state.stores = state.stores.map(store =>
        store.id === action.payload.id ? action.payload : store
      );
      if (state.currentStore?.id === action.payload.id) {
        state.currentStore = action.payload;
      }
    },
    deleteStoreSuccess(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.stores = state.stores.filter(store => store.id !== action.payload);
      state.pagination.total -= 1;
      if (state.currentStore?.id === action.payload) {
        state.currentStore = null;
      }
    },
    toggleStoreStatusSuccess(state, action: PayloadAction<IStoreItem>) {
      state.isLoading = false;
      state.stores = state.stores.map(store =>
        store.id === action.payload.id ? action.payload : store
      );
      if (state.currentStore?.id === action.payload.id) {
        state.currentStore = action.payload;
      }
    },
    resetStoreState(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  startLoading,
  hasError,
  getStoresSuccess,
  getStoreDetailsSuccess,
  createStoreSuccess,
  updateStoreSuccess,
  deleteStoreSuccess,
  toggleStoreStatusSuccess,
  resetStoreState,
} = storeSlice.actions;

// Thunks
export const fetchStores = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await storeRequests.getStores(params);
    dispatch(getStoresSuccess(response));
  } catch (error) {
    dispatch(hasError(error.message));
    throw error;
  }
};

export const fetchStoreDetails = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await storeRequests.getStoreDetails(id);
    dispatch(getStoreDetailsSuccess(response));
  } catch (error) {
    dispatch(hasError(error.message));
    throw error;
  }
};

export const createStore = (data: StoreFormValues) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await storeRequests.createStore(data);
    dispatch(createStoreSuccess(response));
    return response;
  } catch (error) {
    dispatch(hasError(error.message));
    throw error;
  }
};

export const updateStore = (id: string, data: Partial<StoreFormValues>) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(startLoading());
      const response = await storeRequests.updateStore(id, data);
      dispatch(updateStoreSuccess(response));
      return response;
    } catch (error) {
      dispatch(hasError(error.message));
      throw error;
    }
  };

export const deleteStore = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    await storeRequests.deleteStore(id);
    dispatch(deleteStoreSuccess(id));
  } catch (error) {
    dispatch(hasError(error.message));
    throw error;
  }
};

export const activateStore = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await storeRequests.activateStore(id);
    dispatch(toggleStoreStatusSuccess(response));
    return response;
  } catch (error) {
    dispatch(hasError(error.message));
    throw error;
  }
};

export const deactivateStore = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await storeRequests.deactivateStore(id);
    dispatch(toggleStoreStatusSuccess(response));
    return response;
  } catch (error) {
    dispatch(hasError(error.message));
    throw error;
  }
};


export const toggleStoreStatus = (id: string, currentStatus: boolean) => 
  async (dispatch: AppDispatch) => {
    return currentStatus 
      ? dispatch(deactivateStore(id))
      : dispatch(activateStore(id));
  };


export default storeSlice.reducer;


export const selectStoreState = (state: { store: StoreState }) => state.store;
export const selectStores = (state: { store: StoreState }) => state.store.stores;
export const selectCurrentStore = (state: { store: StoreState }) => state.store.currentStore;
export const selectStoreLoading = (state: { store: StoreState }) => state.store.isLoading;
export const selectStoreError = (state: { store: StoreState }) => state.store.error;
export const selectStorePagination = (state: { store: StoreState }) => state.store.pagination;
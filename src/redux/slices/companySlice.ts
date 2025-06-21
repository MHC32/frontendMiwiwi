import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ICompanyItem } from 'src/types/company';

interface CompanyState {
  currentCompany: ICompanyItem | null;
  companies: ICompanyItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  currentCompany: null,
  companies: [],
  isLoading: false,
  error: null,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    // Actions pour la création
    createCompanyStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    createCompanySuccess(state, action: PayloadAction<ICompanyItem>) {
      state.isLoading = false;
      state.companies.push(action.payload);
      state.currentCompany = action.payload;
    },
    createCompanyFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Actions pour la mise à jour
    updateCompanyStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    updateCompanySuccess(state, action: PayloadAction<ICompanyItem>) {
      state.isLoading = false;
      state.currentCompany = action.payload;
      state.companies = state.companies.map(company =>
        company.id === action.payload.id ? action.payload : company
      );
    },
    updateCompanyFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Actions pour la récupération
    getCompanyStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    getCompanySuccess(state, action: PayloadAction<ICompanyItem>) {
      state.isLoading = false;
      state.currentCompany = action.payload;
    },
    getCompanyFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Réinitialisation
    resetCompanyState(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  createCompanyStart,
  createCompanySuccess,
  createCompanyFailure,
  updateCompanyStart,
  updateCompanySuccess,
  updateCompanyFailure,
  getCompanyStart,
  getCompanySuccess,
  getCompanyFailure,
  resetCompanyState,
} = companySlice.actions;

export default companySlice.reducer;
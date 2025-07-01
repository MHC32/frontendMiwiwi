// src/redux/slices/employee.slice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch } from 'src/redux/store';
import { employeeRequests } from 'src/utils/request';
import type { 
  Employee, 
  EmployeeListResponse, 
  EmployeeFormValues,
  IEmployeeListMeta,
  EmployeeQueryParams 
} from 'src/types/employee';

interface EmployeeState {
  isLoading: boolean;
  error: string | null;
  employees: Employee[];
  currentEmployee: Employee | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  meta: IEmployeeListMeta;
}

const initialState: EmployeeState = {
  isLoading: false,
  error: null,
  employees: [],
  currentEmployee: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  meta: {
    totalCompanies: 0,
    totalStores: 0,
  },
};

const employeeSlice = createSlice({
  name: 'employee',
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
    getEmployeesSuccess(state, action: PayloadAction<EmployeeListResponse>) {
      state.isLoading = false;
      state.employees = action.payload.data;
      state.pagination = action.payload.pagination;
      state.meta = action.payload.meta;
    },
    getEmployeeDetailsSuccess(state, action: PayloadAction<Employee>) {
      state.isLoading = false;
      state.currentEmployee = action.payload;
    },
    createEmployeeSuccess(state, action: PayloadAction<Employee>) {
      state.isLoading = false;
      state.employees.unshift(action.payload);
      state.pagination.total += 1;
    },
    updateEmployeeSuccess(state, action: PayloadAction<Employee>) {
      state.isLoading = false;
      state.employees = state.employees.map(emp =>
        emp._id === action.payload._id ? action.payload : emp
      );
      if (state.currentEmployee?._id === action.payload._id) {
        state.currentEmployee = action.payload;
      }
    },
    deleteEmployeeSuccess(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.employees = state.employees.filter(emp => emp._id !== action.payload);
      state.pagination.total -= 1;
      if (state.currentEmployee?._id === action.payload) {
        state.currentEmployee = null;
      }
    },
    toggleEmployeeStatusSuccess(state, action: PayloadAction<Employee>) {
      state.isLoading = false;
      const updatedEmployee = action.payload;
      state.employees = state.employees.map(emp =>
        emp._id === updatedEmployee._id ? updatedEmployee : emp
      );
      if (state.currentEmployee?._id === updatedEmployee._id) {
        state.currentEmployee = updatedEmployee;
      }
    },
    resetEmployeeState(state) {
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
  getEmployeesSuccess,
  getEmployeeDetailsSuccess,
  createEmployeeSuccess,
  updateEmployeeSuccess,
  deleteEmployeeSuccess,
  toggleEmployeeStatusSuccess,
  resetEmployeeState,
  clearError,
} = employeeSlice.actions;

// Thunks (actions asynchrones) mis à jour
export const fetchEmployees = (params?: EmployeeQueryParams) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(startLoading());
      const response = await employeeRequests.getEmployees(params);
      dispatch(getEmployeesSuccess(response));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      dispatch(hasError(errorMessage));
      throw error;
    }
  };

export const fetchEmployeeDetails = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await employeeRequests.getEmployeeDetails(id);
    dispatch(getEmployeeDetailsSuccess(response));
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    dispatch(hasError(errorMessage));
    throw error;
  }
};

export const createEmployee = (data: EmployeeFormValues) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await employeeRequests.createEmployee(data);
    dispatch(createEmployeeSuccess(response));
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    dispatch(hasError(errorMessage));
    throw error;
  }
};

export const updateEmployee = (id: string, data: Partial<EmployeeFormValues>) => 
  async (dispatch: AppDispatch) => {
    try {
      dispatch(startLoading());
      const response = await employeeRequests.updateEmployee(id, data);
      dispatch(updateEmployeeSuccess(response));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      dispatch(hasError(errorMessage));
      throw error;
    }
  };

export const deleteEmployee = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    await employeeRequests.deleteEmployee(id);
    dispatch(deleteEmployeeSuccess(id));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    dispatch(hasError(errorMessage));
    throw error;
  }
};

export const activateEmployee = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await employeeRequests.toggleEmployeeStatus(id, true);
    dispatch(toggleEmployeeStatusSuccess(response));
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    dispatch(hasError(errorMessage));
    throw error;
  }
};

export const deactivateEmployee = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await employeeRequests.toggleEmployeeStatus(id, false);
    dispatch(toggleEmployeeStatusSuccess(response));
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    dispatch(hasError(errorMessage));
    throw error;
  }
};

export const toggleEmployeeStatus = (id: string, currentStatus: boolean) => 
  async (dispatch: AppDispatch) => {
    return currentStatus 
      ? dispatch(deactivateEmployee(id))
      : dispatch(activateEmployee(id));
  };

// Selectors de base
export const selectEmployeeState = (state: { employee: EmployeeState }) => state.employee;
export const selectEmployees = (state: { employee: EmployeeState }) => state.employee.employees;
export const selectCurrentEmployee = (state: { employee: EmployeeState }) => state.employee.currentEmployee;
export const selectEmployeeLoading = (state: { employee: EmployeeState }) => state.employee.isLoading;
export const selectEmployeeError = (state: { employee: EmployeeState }) => state.employee.error;
export const selectEmployeePagination = (state: { employee: EmployeeState }) => state.employee.pagination;
export const selectEmployeeMeta = (state: { employee: EmployeeState }) => state.employee.meta;

// Selectors enrichis
export const selectEmployeeById = (id: string) => (state: { employee: EmployeeState }) => 
  state.employee.employees.find(emp => emp._id === id);

export const selectCashiers = (state: { employee: EmployeeState }) => 
  state.employee.employees.filter(emp => emp.role === 'cashier');

export const selectSupervisors = (state: { employee: EmployeeState }) => 
  state.employee.employees.filter(emp => emp.role === 'supervisor');

// Nouveaux selectors basés sur la structure enrichie
export const selectEmployeesByStoreId = (storeId: string) => (state: { employee: EmployeeState }) => 
  state.employee.employees.filter(emp => 
    emp.assignedStores.some(assignedStore => assignedStore.storeId === storeId)
  );

export const selectEmployeesByCompanyId = (companyId: string) => (state: { employee: EmployeeState }) => 
  state.employee.employees.filter(emp => {
    // Vérifier dans les stores assignés
    const hasStoreInCompany = emp.stores.some(store => store.company_id._id === companyId);
    // Vérifier dans le store supervisé
    const hasSupervisedStoreInCompany = emp.supervisedStore?.company_id._id === companyId;
    
    return hasStoreInCompany || hasSupervisedStoreInCompany;
  });

export const selectActiveEmployees = (state: { employee: EmployeeState }) => 
  state.employee.employees.filter(emp => emp.is_active);

export const selectInactiveEmployees = (state: { employee: EmployeeState }) => 
  state.employee.employees.filter(emp => !emp.is_active);

// Selectors pour les statistiques
export const selectEmployeeStats = (state: { employee: EmployeeState }) => {
  const employees = state.employee.employees;
  return {
    total: employees.length,
    active: employees.filter(emp => emp.is_active).length,
    inactive: employees.filter(emp => !emp.is_active).length,
    cashiers: employees.filter(emp => emp.role === 'cashier').length,
    supervisors: employees.filter(emp => emp.role === 'supervisor').length,
    totalStoresAssigned: employees.reduce((sum, emp) => sum + emp.totalStoresAssigned, 0),
  };
};

// Selector pour obtenir tous les stores uniques des employés
export const selectUniqueStoresFromEmployees = (state: { employee: EmployeeState }) => {
  const allStores = state.employee.employees.flatMap(emp => {
    const stores = [...emp.stores];
    if (emp.supervisedStore) {
      stores.push(emp.supervisedStore);
    }
    return stores;
  });

  // Supprimer les doublons par _id
  return allStores.filter((store, index, self) => 
    index === self.findIndex(s => s._id === store._id)
  );
};

// Selector pour obtenir toutes les companies uniques des employés
export const selectUniqueCompaniesFromEmployees = (state: { employee: EmployeeState }) => {
  const allCompanies = state.employee.employees.flatMap(emp => {
    const companies = emp.stores.map(store => store.company_id);
    if (emp.supervisedStore) {
      companies.push(emp.supervisedStore.company_id);
    }
    return companies;
  });

  // Supprimer les doublons par _id
  return allCompanies.filter((company, index, self) => 
    index === self.findIndex(c => c._id === company._id)
  );
};

export default employeeSlice.reducer;
// src/redux/slices/employee.slice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch } from 'src/redux/store';
import { employeeRequests } from 'src/utils/request';
import type { Cashier, Supervisor, EmployeeListResponse, EmployeeFormValues } from 'src/types/employee';

type Employee = Cashier | Supervisor;

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
} = employeeSlice.actions;

// Thunks (actions asynchrones)
export const fetchEmployees = (params?: {
  page?: number;
  limit?: number;
  storeId?: string;
  role?: 'cashier' | 'supervisor';
  is_active?: boolean;
}) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await employeeRequests.getEmployees(params);
    dispatch(getEmployeesSuccess(response));
  } catch (error) {
    dispatch(hasError(error instanceof Error ? error.message : 'Erreur inconnue'));
  }
};

export const fetchEmployeeDetails = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await employeeRequests.getEmployeeDetails(id);
    dispatch(getEmployeeDetailsSuccess(response));
  } catch (error) {
    dispatch(hasError(error instanceof Error ? error.message : 'Erreur inconnue'));
  }
};

export const createEmployee = (data: EmployeeFormValues) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    const response = await employeeRequests.createEmployee(data);
    dispatch(createEmployeeSuccess(response));
    return response;
  } catch (error) {
    dispatch(hasError(error instanceof Error ? error.message : 'Erreur inconnue'));
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
      dispatch(hasError(error instanceof Error ? error.message : 'Erreur inconnue'));
      throw error;
    }
  };

export const deleteEmployee = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(startLoading());
    await employeeRequests.deleteEmployee(id);
    dispatch(deleteEmployeeSuccess(id));
  } catch (error) {
    dispatch(hasError(error instanceof Error ? error.message : 'Erreur inconnue'));
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
    dispatch(hasError(error.message));
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
    dispatch(hasError(error.message));
    throw error;
  }
};

export const toggleEmployeeStatus = (id: string, currentStatus: boolean) => 
  async (dispatch: AppDispatch) => {
    return currentStatus 
      ? dispatch(deactivateEmployee(id))
      : dispatch(activateEmployee(id));
  };

// Selectors
export const selectEmployeeState = (state: { employee: EmployeeState }) => state.employee;
export const selectEmployees = (state: { employee: EmployeeState }) => state.employee.employees;
export const selectCurrentEmployee = (state: { employee: EmployeeState }) => state.employee.currentEmployee;
export const selectEmployeeLoading = (state: { employee: EmployeeState }) => state.employee.isLoading;
export const selectEmployeeError = (state: { employee: EmployeeState }) => state.employee.error;
export const selectEmployeePagination = (state: { employee: EmployeeState }) => state.employee.pagination;
export const selectEmployeeById = (id: string) => (state: { employee: EmployeeState }) => 
  state.employee.employees.find(emp => emp._id === id);

// Filtres spécifiques
export const selectCashiers = (state: { employee: EmployeeState }) => 
  state.employee.employees.filter(emp => emp.role === 'cashier');

export const selectSupervisors = (state: { employee: EmployeeState }) => 
  state.employee.employees.filter(emp => emp.role === 'supervisor');

export const selectEmployeesByStore = (storeId: string) => (state: { employee: EmployeeState }) => 
  state.employee.employees.filter(emp => 
    (emp.role === 'cashier' && emp.store_id === storeId) ||
    (emp.role === 'supervisor' && emp.supervised_store_id === storeId)
  );

export default employeeSlice.reducer;
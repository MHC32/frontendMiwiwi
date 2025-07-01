import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// types
import { Cashier, Supervisor, IEmployeeTableFilters, IEmployeeTableFilterValue } from 'src/types/employee';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useSnackbar } from 'src/components/snackbar';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
// requests
import { employeeRequests, storeRequests } from 'src/utils/request';
//
import EmployeeTableRow from '../employee-table-row';
import EmployeeTableToolbar from '../employee-table-toolbar';
import EmployeeTableFiltersResult from '../employee-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
];

const ROLE_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'cashier', label: 'Caissier' },
  { value: 'supervisor', label: 'Superviseur' },
];

const TABLE_HEAD = [
  { id: 'name', label: 'Nom' },
  { id: 'phone', label: 'Téléphone', width: 180 },
  { id: 'role', label: 'Rôle', width: 120 },
  { id: 'status', label: 'Statut', width: 100 },
  { id: 'store', label: 'Magasin', width: 180 },
  { id: '', width: 88 },
];

const defaultFilters: IEmployeeTableFilters = {
  name: '',
  store_id: [],
  is_active: 'all',
  role: 'all',
};

// ----------------------------------------------------------------------

export default function EmployeeListView() {
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const { enqueueSnackbar } = useSnackbar();

  const [tableData, setTableData] = useState<Array<Cashier | Supervisor>>([]);
  const [stores, setStores] = useState<string[]>([]);
  const [filters, setFilters] = useState<IEmployeeTableFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await employeeRequests.getEmployees({
      page: table.page + 1,
      limit: table.rowsPerPage,
      is_active: filters.is_active === 'all' ? undefined : filters.is_active === 'active',
      role: filters.role === 'all' ? undefined : filters.role as 'cashier' | 'supervisor',
      storeId: filters.store_id.length ? filters.store_id[0] : undefined, 
      });
      setTableData(response.data);
      
      // Récupérer les magasins pour les filtres
      const storesResponse = await storeRequests.getStores({ limit: 100, is_active: true });
      setStores(storesResponse.data.map(store => store.id));
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      enqueueSnackbar('Erreur lors du chargement des employés', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [filters.name, filters.is_active, filters.role, filters.store_id, table.page, table.rowsPerPage, enqueueSnackbar]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleToggleStatus = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      // Mise à jour optimiste
      setTableData(prev => prev.map(employee => 
        employee._id === id ? { ...employee, is_active: !currentStatus } : employee
      ));

      const response = await employeeRequests.toggleEmployeeStatus(id, !currentStatus);
      
      // Mise à jour avec les données du serveur
      setTableData(prev => prev.map(employee => 
        employee._id === id ? response : employee
      ));
      
      enqueueSnackbar(`Employé ${currentStatus ? 'désactivé' : 'activé'} avec succès`, {
        variant: 'success'
      });
    } catch (error) {
      // Annuler la modification optimiste en cas d'erreur
      setTableData(prev => prev.map(employee => 
        employee._id === id ? { ...employee, is_active: currentStatus } : employee
      ));
      
      console.error('Failed to toggle employee status:', error);
      enqueueSnackbar(
        error.message || 'Erreur lors du changement de statut',
        { variant: 'error' }
      );
    }
  }, [enqueueSnackbar]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name: string, value: IEmployeeTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await employeeRequests.deleteEmployee(id);
        await fetchEmployees();
        table.onUpdatePageDeleteRow(dataInPage.length);
        enqueueSnackbar('Employé supprimé avec succès', { variant: 'success' });
      } catch (error) {
        console.error('Failed to delete employee:', error);
        enqueueSnackbar(
          error.message || 'Erreur lors de la suppression',
          { variant: 'error' }
        );
      }
    },
    [dataInPage.length, fetchEmployees, table, enqueueSnackbar]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(table.selected.map(id => employeeRequests.deleteEmployee(id)));
      await fetchEmployees();
      table.onUpdatePageDeleteRows({
        totalRows: tableData.length,
        totalRowsInPage: dataInPage.length,
        totalRowsFiltered: dataFiltered.length,
      });
      confirm.onFalse();
      enqueueSnackbar('Employés supprimés avec succès', { variant: 'success' });
    } catch (error) {
      console.error('Failed to delete employees:', error);
      enqueueSnackbar(
        error.message || 'Erreur lors de la suppression',
        { variant: 'error' }
      );
    }
  }, [
    confirm,
    dataFiltered.length,
    dataInPage.length,
    fetchEmployees,
    table,
    table.selected,
    tableData.length,
    enqueueSnackbar
  ]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.employee.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('is_active', newValue);
    },
    [handleFilters]
  );

  const handleFilterRole = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('role', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Employés"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Liste' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.employee.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Nouvel employé
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Tabs
            value={filters.is_active}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.is_active) && 'filled') || 'soft'
                    }
                    color={
                      (tab.value === 'active' && 'success') ||
                      (tab.value === 'inactive' && 'error') ||
                      'default'
                    }
                  >
                    {tab.value === 'all' && tableData.length}
                    {tab.value === 'active' &&
                      tableData.filter((employee) => employee.is_active).length}
                    {tab.value === 'inactive' &&
                      tableData.filter((employee) => !employee.is_active).length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <Tabs
            value={filters.role}
            onChange={handleFilterRole}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {ROLE_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.role) && 'filled') || 'soft'
                    }
                    color={
                      (tab.value === 'cashier' && 'info') ||
                      (tab.value === 'supervisor' && 'warning') ||
                      'default'
                    }
                  >
                    {tab.value === 'all' && tableData.length}
                    {tab.value === 'cashier' &&
                      tableData.filter((employee) => employee.role === 'cashier').length}
                    {tab.value === 'supervisor' &&
                      tableData.filter((employee) => employee.role === 'supervisor').length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <EmployeeTableToolbar
            filters={filters}
            onFilters={handleFilters}
            storeOptions={stores}
            onRefresh={fetchEmployees}
          />

          {canReset && (
            <EmployeeTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row._id)
                )
              }
              action={
                <Tooltip title="Supprimer">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row._id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <EmployeeTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onDeleteRow={() => handleDeleteRow(row._id)}
                        onEditRow={() => handleEditRow(row._id)}
                        onToggleStatus={() => handleToggleStatus(row._id, row.is_active)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Supprimer"
        content={
          <>
            Êtes-vous sûr de vouloir supprimer <strong>{table.selected.length}</strong> employé(s) ?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteRows}
          >
            Supprimer
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: Array<Cashier | Supervisor>;
  comparator: (a: any, b: any) => number;
  filters: IEmployeeTableFilters;
}) {
  const { name, is_active, role, store_id } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (employee) => 
        `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (is_active !== 'all') {
    const isActive = is_active === 'active';
    inputData = inputData.filter((employee) => employee.is_active === isActive);
  }

  if (role !== 'all') {
    inputData = inputData.filter((employee) => employee.role === role);
  }

  if (store_id.length) {
    inputData = inputData.filter((employee) => {
      if (employee.role === 'cashier') {
        return store_id.includes((employee as Cashier).store_id);
      } else {
        return store_id.includes((employee as Supervisor).supervised_store_id);
      }
    });
  }

  return inputData;
}
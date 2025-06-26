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
import { IStoreItem, IStoreTableFilters, IStoreTableFilterValue } from 'src/types/store';
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
import { storeRequests } from 'src/utils/request';
//
import StoreTableRow from '../store-table-row';
import StoreTableToolbar from '../store-table-toolbar';
import StoreTableFiltersResult from '../store-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
];

const TABLE_HEAD = [
  { id: 'name', label: 'Nom' },
  { id: 'phone', label: 'Téléphone', width: 180 },
  { id: 'status', label: 'Statut', width: 100 },
  { id: 'employees', label: 'Employés', width: 100 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  city: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function StoreListView() {
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const { enqueueSnackbar } = useSnackbar();

  const [tableData, setTableData] = useState<IStoreItem[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [filters, setFilters] = useState<IStoreTableFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStores = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await storeRequests.getStores({
        page: table.page + 1,
        limit: table.rowsPerPage,
        search: filters.name,
        is_active: filters.status === 'all' ? undefined : filters.status === 'active',
      });
      setTableData(response.data);
      
      // Extraire les villes uniques pour les filtres
      const uniqueCities = Array.from(
        new Set(response.data.map(store => store.contact?.address?.city).filter(Boolean))
      );
      setCities(uniqueCities);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
      enqueueSnackbar('Erreur lors du chargement des magasins', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [filters.name, filters.status, table.page, table.rowsPerPage, enqueueSnackbar]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

 const handleToggleStatus = useCallback(async (id: string, currentStatus: boolean) => {
  try {
    // Mise à jour optimiste immédiate
    setTableData(prev => prev.map(store => 
      store.id === id ? { ...store, is_active: !currentStatus } : store
    ));

    const action = currentStatus ? 'deactivate' : 'activate';
    await storeRequests[`${action}Store`](id);
    
    // Rafraîchir les données après succès
    await fetchStores();
    
    enqueueSnackbar(`Magasin ${currentStatus ? 'désactivé' : 'activé'} avec succès`, {
      variant: 'success'
    });
  } catch (error) {
    // Annuler la modification optimiste en cas d'erreur
    setTableData(prev => prev.map(store => 
      store.id === id ? { ...store, is_active: currentStatus } : store
    ));
    
    console.error('Failed to toggle store status:', error);
    enqueueSnackbar(
      error.message || 'Erreur lors du changement de statut',
      { variant: 'error' }
    );
  }
}, [enqueueSnackbar, fetchStores]);

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
    (name: string, value: IStoreTableFilterValue) => {
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
        await storeRequests.deleteStore(id);
        await fetchStores();
        table.onUpdatePageDeleteRow(dataInPage.length);
        enqueueSnackbar('Magasin supprimé avec succès', { variant: 'success' });
      } catch (error) {
        console.error('Failed to delete store:', error);
        enqueueSnackbar(
          error.message || 'Erreur lors de la suppression',
          { variant: 'error' }
        );
      }
    },
    [dataInPage.length, fetchStores, table, enqueueSnackbar]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(table.selected.map(id => storeRequests.deleteStore(id)));
      await fetchStores();
      table.onUpdatePageDeleteRows({
        totalRows: tableData.length,
        totalRowsInPage: dataInPage.length,
        totalRowsFiltered: dataFiltered.length,
      });
      confirm.onFalse();
      enqueueSnackbar('Magasins supprimés avec succès', { variant: 'success' });
    } catch (error) {
      console.error('Failed to delete stores:', error);
      enqueueSnackbar(
        error.message || 'Erreur lors de la suppression',
        { variant: 'error' }
      );
    }
  }, [
    confirm,
    dataFiltered.length,
    dataInPage.length,
    fetchStores,
    table,
    table.selected,
    tableData.length,
    enqueueSnackbar
  ]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.store.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue);
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
          heading="Magasins"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Liste' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.store.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Nouveau magasin
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Tabs
            value={filters.status}
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
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={
                      (tab.value === 'active' && 'success') ||
                      (tab.value === 'inactive' && 'error') ||
                      'default'
                    }
                  >
                    {tab.value === 'all' && tableData.length}
                    {tab.value === 'active' &&
                      tableData.filter((store) => store.is_active).length}
                    {tab.value === 'inactive' &&
                      tableData.filter((store) => !store.is_active).length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <StoreTableToolbar
            filters={filters}
            onFilters={handleFilters}
            cityOptions={cities}
            onRefresh={fetchStores}
          />

          {canReset && (
            <StoreTableFiltersResult
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
                  tableData.map((row) => row.id)
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
                      tableData.map((row) => row.id)
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
                      <StoreTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onToggleStatus={() => handleToggleStatus(row.id, row.is_active)}
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
            Êtes-vous sûr de vouloir supprimer <strong>{table.selected.length}</strong> magasin(s) ?
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
  inputData: IStoreItem[];
  comparator: (a: any, b: any) => number;
  filters: IStoreTableFilters;
}) {
  const { name, status, city } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (store) => store.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    const isActive = status === 'active';
    inputData = inputData.filter((store) => store.is_active === isActive);
  }

  if (city.length) {
    inputData = inputData.filter((store) => 
      store.contact?.address?.city && city.includes(store.contact.address.city)
    );
  }

  return inputData;
}
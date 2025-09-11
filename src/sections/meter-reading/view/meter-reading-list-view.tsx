// src/sections/meter-reading/view/meter-reading-list-view.tsx
import { useState, useCallback, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
// routes
import { paths } from 'src/routes/paths';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useTable, getComparator } from 'src/components/table';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {LoadingScreen} from 'src/components/loading-screen';
import {
  useTable as useTableComponent,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// redux
import { useSelector, useDispatch } from 'src/redux/store';
import { 
  selectStores, 
  selectStoreLoading,
  fetchStores 
} from 'src/redux/slices/store.slice';
import {
  selectMeterReadings,
  selectMeterReadingLoading,
  fetchStoreReadings
} from 'src/redux/slices/meter-reading.slice';
// types
import { 
  IMeterReadingItem, 
  IMeterReadingTableFilters,
  MeterReadingStatus
} from 'src/types/meter-reading';
import { IStoreItem } from 'src/types/store';
// api
import { meterReadingRequests } from 'src/utils/request';
//
import MeterReadingTableRow from '../meter-reading-table-row';
import MeterReadingTableToolbar from '../meter-reading-table-toolbar';
import MeterReadingVerifyDialog from '../meter-reading-verify-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'reading_value', label: 'Valeur' },
  { id: 'reading_type', label: 'Type' },
  { id: 'cashier', label: 'Caissier' },
  { id: 'created_at', label: 'Date' },
  { id: 'status', label: 'Statut' },
  { id: '', width: 88 },
];

const defaultFilters: IMeterReadingTableFilters = {
  name: '',
  status: 'all',
  type: 'all',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function MeterReadingListView() {
  const settings = useSettingsContext();
  const dispatch = useDispatch();

  const table = useTable();
  const confirm = useBoolean();

  // State local
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [tableData, setTableData] = useState<IMeterReadingItem[]>([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedReading, setSelectedReading] = useState<IMeterReadingItem | null>(null);

  // Redux state
  const stores = useSelector(selectStores);
  const storeLoading = useSelector(selectStoreLoading);
  const meterReadingLoading = useSelector(selectMeterReadingLoading);

  const loading = storeLoading || meterReadingLoading;

  // Charger les magasins au mount
  useEffect(() => {
    if (stores.length === 0) {
      dispatch(fetchStores({ is_active: true }));
    }
  }, [dispatch, stores.length]);

  // Auto-sélectionner le premier magasin si aucun n'est sélectionné
  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId]);

  // Charger les relevés quand le magasin change
  useEffect(() => {
    if (selectedStoreId) {
      fetchReadings();
    }
  }, [selectedStoreId]);

  const fetchReadings = useCallback(async () => {
    if (!selectedStoreId) return;

    try {
      const apiFilters: any = {};
      
      if (filters.startDate) {
        apiFilters.date = filters.startDate.toISOString().split('T')[0];
      }
      if (filters.type !== 'all') {
        apiFilters.type = filters.type;
      }
      if (filters.status !== 'all') {
        apiFilters.status = filters.status as MeterReadingStatus;
      }

      const response = await meterReadingRequests.getStoreReadings(selectedStoreId, apiFilters);
      setTableData(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des relevés:', error);
      setTableData([]);
    }
  }, [selectedStoreId, filters]);

  // Filtrage et tri des données
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
  const canReset = !!filters.name || filters.status !== 'all' || filters.type !== 'all' || (!!filters.startDate && !!filters.endDate);
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  // Handlers
  const handleStoreChange = useCallback((storeId: string) => {
    setSelectedStoreId(storeId);
    table.onResetPage();
  }, [table]);

  const handleFilters = useCallback((name: string, value: any) => {
    table.onResetPage();
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, [table]);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleVerifyReading = useCallback((reading: IMeterReadingItem) => {
    setSelectedReading(reading);
    confirm.onTrue();
  }, [confirm]);

  const handleDeleteRow = useCallback((id: string) => {
    const deleteRow = tableData.filter((row) => row.id !== id);
    setTableData(deleteRow);
    table.onUpdatePageDeleteRow(dataInPage.length);
  }, [dataInPage.length, table, tableData]);

  // Trouver le magasin sélectionné
  const selectedStore = stores.find(store => store.id === selectedStoreId);

  if (loading && stores.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Relevés de Compteur"
        links={[
          { name: 'Tableau de bord', href: paths.dashboard.root },
          { name: 'Relevés de Compteur' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {stores.length === 0 ? (
        <Card>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Aucun magasin disponible
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aucun magasin actif trouvé pour les relevés de compteur.
            </Typography>
          </Box>
        </Card>
      ) : (
        <Card>
          {/* Toolbar avec dropdown de sélection de magasin */}
          <MeterReadingTableToolbar
            stores={stores}
            selectedStoreId={selectedStoreId}
            onStoreChange={handleStoreChange}
            filters={filters}
            onFilters={handleFilters}
            canReset={canReset}
            onResetFilters={handleResetFilters}
          />

          {selectedStoreId && (
            <>
              {/* Affichage du magasin sélectionné */}
              {selectedStore && (
                <Box sx={{ p: 3, pb: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Iconify icon="solar:shop-bold" width={24} />
                    <Typography variant="h6">
                      {selectedStore.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedStore.contact.address.city}
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Scrollbar>
                <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                  <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                    <TableHeadCustom
                      order={table.order}
                      orderBy={table.orderBy}
                      headLabel={TABLE_HEAD}
                      rowCount={dataFiltered.length}
                      numSelected={table.selected.length}
                      onSort={table.onSort}
                      onSelectAllRows={(checked) =>
                        table.onSelectAllRows(
                          checked,
                          dataFiltered.map((row) => row.id)
                        )
                      }
                    />

                    <TableBody>
                      {loading ? (
                        <TableEmptyRows height={denseHeight} emptyRows={table.rowsPerPage} />
                      ) : (
                        <>
                          {dataInPage.map((row) => (
                            <MeterReadingTableRow
                              key={row.id}
                              row={row}
                              selected={table.selected.includes(row.id)}
                              onSelectRow={() => table.onSelectRow(row.id)}
                              onDeleteRow={() => handleDeleteRow(row.id)}
                              onVerifyReading={() => handleVerifyReading(row)}
                            />
                          ))}

                          <TableEmptyRows
                            height={denseHeight}
                            emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                          />

                          <TableNoData notFound={notFound} />
                        </>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Scrollbar>

              <TablePaginationCustom
                count={dataFiltered.length}
                page={table.page}
                rowsPerPage={table.rowsPerPage}
                onPageChange={table.onChangePage}
                onRowsPerPageChange={table.onChangeRowsPerPage}
                dense={table.dense}
                onChangeDense={table.onChangeDense}
              />
            </>
          )}

          {!selectedStoreId && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Sélectionnez un magasin pour voir ses relevés de compteur
              </Typography>
            </Box>
          )}
        </Card>
      )}

      <MeterReadingVerifyDialog
        reading={selectedReading}
        open={confirm.value}
        onClose={confirm.onFalse}
        onSuccess={fetchReadings}
      />
    </Container>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: IMeterReadingItem[];
  comparator: (a: any, b: any) => number;
  filters: IMeterReadingTableFilters;
}) {
  const { name, status, type, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (reading) =>
        reading.cashier.first_name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        reading.cashier.last_name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((reading) => reading.status === status);
  }

  if (type !== 'all') {
    inputData = inputData.filter((reading) => reading.reading_type === type);
  }

  if (startDate && endDate) {
    inputData = inputData.filter(
      (reading) => new Date(reading.created_at) >= startDate && new Date(reading.created_at) <= endDate
    );
  }

  return inputData;
}
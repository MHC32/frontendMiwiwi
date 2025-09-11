import { useState, useCallback, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useTable, getComparator } from 'src/components/table';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Tooltip from '@mui/material/Tooltip';
import TableContainer from '@mui/material/TableContainer';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import {
  useTable as useTableComponent,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
// types
import { 
  IMeterReadingItem, 
  IMeterReadingFilters,
  IMeterReadingTableFilters,
  MeterReadingStatus
} from 'src/types/meter-reading';
import { IStoreItem } from 'src/types/store';
// api
import { meterReadingRequests, storeRequests } from 'src/utils/request';
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

export default function MeterReadingStoreView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const params = useParams();

  const { storeId } = params;

  const table = useTable();
  const confirm = useBoolean();

  const [store, setStore] = useState<IStoreItem | null>(null);
  const [tableData, setTableData] = useState<IMeterReadingItem[]>([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedReading, setSelectedReading] = useState<IMeterReadingItem | null>(null);

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

  const fetchStoreDetails = useCallback(async () => {
    if (!storeId) return;
    
    try {
      const storeDetails = await storeRequests.getStoreDetails(storeId);
      setStore(storeDetails);
    } catch (error) {
      console.error('Erreur lors du chargement du magasin:', error);
    }
  }, [storeId]);

  const fetchReadings = useCallback(async () => {
    if (!storeId) return;

    try {
      const apiFilters: IMeterReadingFilters = {};
      
      if (filters.startDate) {
        apiFilters.date = filters.startDate.toISOString().split('T')[0];
      }
      if (filters.type !== 'all') {
        apiFilters.type = filters.type as any;
      }
      if (filters.status !== 'all') {
        apiFilters.status = filters.status as MeterReadingStatus;
      }

      const response = await meterReadingRequests.getStoreReadings(storeId, apiFilters);
      setTableData(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des relevés:', error);
    }
  }, [storeId, filters]);

  useEffect(() => {
    fetchStoreDetails();
    fetchReadings();
  }, [fetchStoreDetails, fetchReadings]);

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

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={`Relevés - ${store?.name || 'Chargement...'}`}
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Relevés de Compteur', href: paths.dashboard.meterReading.list },
            { name: store?.name || 'Magasin' },
          ]}
          action={
            <Button
              onClick={() => router.back()}
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
            >
              Retour
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <MeterReadingTableToolbar
            filters={filters}
            onFilters={handleFilters}
            canReset={canReset}
            onResetFilters={handleResetFilters}
          />

          <Scrollbar>
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
                    <IconButton color="primary">
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                }
              />

              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
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
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
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
        </Card>
      </Container>

      <MeterReadingVerifyDialog
        reading={selectedReading}
        open={confirm.value}
        onClose={confirm.onFalse}
        onSuccess={fetchReadings}
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
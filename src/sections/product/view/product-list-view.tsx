import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// types
import { IProductItem, IProductTableFilters, IProductTableFilterValue } from 'src/types/product';
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
import { productRequests } from 'src/utils/request';
// redux
import { useDispatch } from 'src/redux/store';
import { getProducts } from 'src/redux/slices/product';
// hooks
import { useProduct } from '../../../hooks/use-product';

import ProductTableRow from '../product-table-row';
import ProductTableToolbar from '../product-table-toolbar';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tous types' },
  { value: 'weight', label: 'Poids' },
  { value: 'fuel', label: 'Carburant' },
  { value: 'unit', label: 'Unité' },
];

const TABLE_HEAD = [
  { id: 'name', label: 'Produit' },
  { id: 'type', label: 'Type', width: 120 },
  { id: 'store', label: 'Magasin', width: 180 },
  { id: 'category', label: 'Catégorie', width: 150 },
  { id: 'stock', label: 'Stock', width: 120, align: 'right' },
  { id: 'price', label: 'Prix', width: 120, align: 'right' },
  { id: 'status', label: 'Statut', width: 100 },
  { id: '', width: 88 },
];

const defaultFilters: IProductTableFilters = {
  name: '',
  store_id: [],
  category_id: [],
  type: 'all',
  status: 'all',
};

// ----------------------------------------------------------------------

export default function ProductListView() {
  const dispatch = useDispatch();
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const { products, loading, pagination } = useProduct();

  const [tableData, setTableData] = useState<IProductItem[]>([]);
  const [filters, setFilters] = useState<IProductTableFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await productRequests.getProducts({
        page: table.page + 1,
        limit: table.rowsPerPage,
        search: filters.name,
        type: filters.type === 'all' ? undefined : filters.type,
        storeId: filters.store_id.length ? filters.store_id[0] : undefined,
        categoryId: filters.category_id.length ? filters.category_id[0] : undefined,
      });
      setTableData(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      enqueueSnackbar('Erreur lors du chargement des produits', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [filters, table.page, table.rowsPerPage, enqueueSnackbar]);

  useEffect(() => {
    // ✅ Correction: Dispatch l'action correctement
    dispatch(getProducts({
      page: 1,
      limit: 10,
      search: '',
    }));
  }, [dispatch]);

  const handleToggleStatus = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      // Mise à jour optimiste
      setTableData(prev => prev.map(product =>
        product._id === id ? { ...product, is_active: !currentStatus } : product
      ));

      const action = currentStatus ? 'deactivateProduct' : 'reactivateProduct';
      await productRequests[action](id);

      await fetchProducts();

      enqueueSnackbar(`Produit ${currentStatus ? 'désactivé' : 'activé'} avec succès`, {
        variant: 'success'
      });
    } catch (error) {
      // Annuler la modification optimiste
      setTableData(prev => prev.map(product =>
        product._id === id ? { ...product, is_active: currentStatus } : product
      ));

      console.error('Failed to toggle product status:', error);
      enqueueSnackbar('Erreur lors du changement de statut', { variant: 'error' });
    }
  }, [enqueueSnackbar, fetchProducts]);

  const dataFiltered = tableData.filter(product => {
    // Filtre par statut
    if (filters.status !== 'all') {
      const isActive = filters.status === 'active';
      if (product.is_active !== isActive) return false;
    }
    
    // Filtre par type
    if (filters.type !== 'all') {
      if (product.type !== filters.type) return false;
    }
    
    // Filtre par magasin
    if (filters.store_id.length > 0) {
      if (!filters.store_id.includes(product.store_id._id)) return false;
    }
    
    // Filtre par catégorie
    if (filters.category_id.length > 0) {
      if (!product.category_id || !filters.category_id.includes(product.category_id._id)) return false;
    }
    
    // Recherche par nom/code-barres
    if (filters.name) {
      const searchLower = filters.name.toLowerCase();
      if (!product.name.toLowerCase().includes(searchLower) && 
          !product.barcode?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name: string, value: IProductTableFilterValue) => {
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
        await productRequests.deactivateProduct(id);
        await fetchProducts();
        table.onUpdatePageDeleteRow(dataInPage.length);
        enqueueSnackbar('Produit supprimé avec succès', { variant: 'success' });
      } catch (error) {
        console.error('Failed to delete product:', error);
        enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
      }
    },
    [dataInPage.length, fetchProducts, table, enqueueSnackbar]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.product.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Produits"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Liste' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.product.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Nouveau produit
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
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
                      tableData.filter((product) => product.is_active).length}
                    {tab.value === 'inactive' &&
                      tableData.filter((product) => !product.is_active).length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <ProductTableToolbar
            filters={filters}
            onFilters={handleFilters}
            onRefresh={fetchProducts}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
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
                      <ProductTableRow
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
    </>
  );
}
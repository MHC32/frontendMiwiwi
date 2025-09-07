// src/sections/category/view/category-list-view.tsx
import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'src/redux/store';
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
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// types
import { 
  ICategory,
  CategoryTreeNode,
  buildCategoryTree,
  getCategoryFullName 
} from 'src/types/category';
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
// redux
import {
  fetchCategories,
  toggleCategoryStatus,
  selectCategories,
  selectCategoryLoading,
  selectCategoryError,
  selectCategoryStats,
  setFilters
} from '../../../redux/slices/category';
import { selectStores, fetchStores } from 'src/redux/slices/store.slice';
//
import CategoryTableRow from '../category-table-row'
import CategoryTableToolbar from '../category-table-toolbar';
import CategoryTableFiltersResult from '../category-table-filters-result';
import CategoryCreateDialog from '../category-create-dialog';
import CategoryEditDialog from '../category-edit-dialog';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
];

const PARENT_OPTIONS = [
  { value: 'all', label: 'Toutes' },
  { value: 'root', label: 'Racines seulement' },
  { value: 'children', label: 'Sous-catégories' },
];

const TABLE_HEAD = [
  { id: 'name', label: 'Nom' },
  { id: 'parent', label: 'Parent', width: 200 },
  { id: 'stores', label: 'Magasins', width: 120 },
  { id: 'color', label: 'Couleur', width: 100 },
  { id: 'status', label: 'Statut', width: 100 },
  { id: '', width: 88 },
];

interface ICategoryTableFilters {
  name: string;
  status: 'all' | 'active' | 'inactive';
  parentFilter: 'all' | 'root' | 'children';
  storeId: string;
}

const defaultFilters: ICategoryTableFilters = {
  name: '',
  status: 'all',
  parentFilter: 'all',
  storeId: '',
};

// ----------------------------------------------------------------------

export default function CategoryListView() {
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  // State pour les dialogs
  const createDialog = useBoolean();
  const editDialog = useBoolean();
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);

  // Redux state
  const categories = useSelector(selectCategories);
  const stores = useSelector(selectStores);
  const isLoading = useSelector(selectCategoryLoading);
  const error = useSelector(selectCategoryError);
  const stats = useSelector(selectCategoryStats);

  // Filtres locaux
  const [filters, setLocalFilters] = useState<ICategoryTableFilters>(defaultFilters);

  // Data filtration
  const dataFiltered = applyFilter({
    inputData: categories,
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

  // Chargement initial
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchCategories()),
          dispatch(fetchStores({ limit: 100, is_active: true }))
        ]);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    loadData();
  }, [dispatch]);

  // Gestion des filtres
  const handleFilters = useCallback((name: string, value: any) => {
    table.onResetPage();
    setLocalFilters(prevState => ({
      ...prevState,
      [name]: value,
    }));
  }, [table]);

  const handleResetFilters = useCallback(() => {
    setLocalFilters(defaultFilters);
  }, []);

  // Actions sur les catégories
  const handleToggleStatus = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      await dispatch(toggleCategoryStatus(id, currentStatus));
      enqueueSnackbar(
        `Catégorie ${currentStatus ? 'désactivée' : 'activée'} avec succès`,
        { variant: 'success' }
      );
    } catch (error) {
      enqueueSnackbar('Erreur lors de la modification du statut', { variant: 'error' });
    }
  }, [dispatch, enqueueSnackbar]);

  const handleEditCategory = useCallback((category: ICategory) => {
    setSelectedCategory(category);
    editDialog.onTrue();
  }, [editDialog]);

  const handleDeleteCategory = useCallback(async (id: string) => {
    try {
      // Logique de suppression si implémentée
      enqueueSnackbar('Catégorie supprimée avec succès', { variant: 'success' });
      await dispatch(fetchCategories()); // Recharger les données
    } catch (error) {
      enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
    }
  }, [dispatch, enqueueSnackbar]);

  // Handlers pour les dialogs
  const handleCreateSuccess = useCallback(() => {
    createDialog.onFalse();
    dispatch(fetchCategories());
    enqueueSnackbar('Catégorie créée avec succès', { variant: 'success' });
  }, [createDialog, dispatch, enqueueSnackbar]);

  const handleEditSuccess = useCallback(() => {
    editDialog.onFalse();
    setSelectedCategory(null);
    dispatch(fetchCategories());
    enqueueSnackbar('Catégorie mise à jour avec succès', { variant: 'success' });
  }, [editDialog, dispatch, enqueueSnackbar]);

  // Calcul des statistiques pour les onglets
  const statusCounts = {
    all: stats.total,
    active: stats.active,
    inactive: stats.inactive,
  };

  const TABS = [
    {
      value: 'all',
      label: 'Toutes',
      color: 'default' as const,
      count: statusCounts.all,
    },
    {
      value: 'active',
      label: 'Actives',
      color: 'success' as const,
      count: statusCounts.active,
    },
    {
      value: 'inactive',
      label: 'Inactives',
      color: 'error' as const,
      count: statusCounts.inactive,
    },
  ];

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Catégories"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Catégories', href: paths.dashboard.category.root },
            { name: 'Liste' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={createDialog.onTrue}
            >
              Nouvelle catégorie
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Tabs
            value={filters.status}
            onChange={(event, newValue) => handleFilters('status', newValue)}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {TABS.map((tab) => (
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
                    color={tab.color}
                  >
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <CategoryTableToolbar
            filters={filters}
            onFilters={handleFilters}
            stores={stores.map(store => ({ value: store.id, label: store.name }))}
          />

          {canReset && (
            <CategoryTableFiltersResult
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
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row._id)
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
                      dataFiltered.map((row) => row._id)
                    )
                  }
                />

                <TableBody>
                  {dataInPage.map((row) => (
                    <CategoryTableRow
                      key={row._id}
                      row={row}
                      categories={categories}
                      stores={stores}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
                      onEditRow={() => handleEditCategory(row)}
                      onToggleStatus={() => handleToggleStatus(row._id, row.is_active)}
                      onDeleteRow={() => handleDeleteCategory(row._id)}
                    />
                  ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
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

      {/* Dialogs */}
      <CategoryCreateDialog
        open={createDialog.value}
        onClose={createDialog.onFalse}
        onSuccess={handleCreateSuccess}
        stores={stores}
        categories={categories}
      />

     

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Supprimer"
        content={
          <>
            Êtes-vous sûr de vouloir supprimer{' '}
            <strong>{table.selected.length}</strong> catégorie(s) ?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              // Logique de suppression multiple
              confirm.onFalse();
            }}
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
  inputData: ICategory[];
  comparator: (a: any, b: any) => number;
  filters: ICategoryTableFilters;
}) {
  const { name, status, parentFilter, storeId } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (category) => category.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((category) => {
      if (status === 'active') return category.is_active;
      if (status === 'inactive') return !category.is_active;
      return true;
    });
  }

  if (parentFilter !== 'all') {
    inputData = inputData.filter((category) => {
      if (parentFilter === 'root') return !category.parent_id;
      if (parentFilter === 'children') return !!category.parent_id;
      return true;
    });
  }

  if (storeId) {
    inputData = inputData.filter((category) => category.stores.includes(storeId));
  }

  return inputData;
}
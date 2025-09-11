// src/sections/report/view/report-store-view.tsx
import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'src/redux/store';
// @mui
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
// types
import { formatPeriod } from 'src/types/report';
// redux
import {
  selectStoreReport,
  selectReportLoading,
  selectReportError,
  selectReportFilters,
  selectFiltersValid,
  fetchStoreReport,
  initializeReportFilters,
} from 'src/redux/slices/report.slice';
import { selectStores, fetchStores, selectStoreById } from 'src/redux/slices/store.slice';
//
import ReportFilters from '../report-filters';
import { RevenueWidget, OrdersWidget, AverageOrderWidget } from '../report-widget';
import TopProductsTable from '../top-products-table';

// ----------------------------------------------------------------------

export default function ReportStoreView() {
  const router = useRouter();
  const params = useParams();
  const settings = useSettingsContext();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { storeId } = params;

  const storeReport = useSelector(selectStoreReport);
  const loading = useSelector(selectReportLoading);
  const error = useSelector(selectReportError);
  const filters = useSelector(selectReportFilters);
  const filtersValid = useSelector(selectFiltersValid);
  const stores = useSelector(selectStores);
  const currentStore = useSelector(selectStoreById(storeId as string));

  // Initialisation
  useEffect(() => {
    dispatch(initializeReportFilters('month'));
    dispatch(fetchStores({ is_active: true }));
  }, [dispatch]);

  // Chargement automatique quand les filtres sont valides et le storeId disponible
  useEffect(() => {
    if (filtersValid && storeId) {
      handleLoadData();
    }
  }, [filtersValid, storeId, filters.startDate, filters.endDate]);

  const handleLoadData = useCallback(async () => {
    if (!storeId) return;
    
    try {
      await dispatch(fetchStoreReport(storeId));
    } catch (error) {
      enqueueSnackbar(
        error?.message || 'Erreur lors du chargement des données',
        { variant: 'error' }
      );
    }
  }, [dispatch, storeId, enqueueSnackbar]);

  const handleFiltersChange = useCallback(() => {
    if (filtersValid && storeId) {
      handleLoadData();
    }
  }, [filtersValid, storeId, handleLoadData]);

  const handleBackToOverview = useCallback(() => {
    router.push(paths.dashboard.report.overview);
  }, [router]);

  const handleExportPDF = useCallback(async () => {
    try {
      // TODO: Implémenter l'export PDF du rapport magasin
      enqueueSnackbar('Export PDF en cours de développement', { variant: 'info' });
    } catch (error) {
      enqueueSnackbar('Erreur lors de l\'export', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  if (loading && !storeReport) {
    return <LoadingScreen />;
  }

  if (!storeId) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Alert severity="error">
          ID du magasin non fourni
        </Alert>
      </Container>
    );
  }

  const storeName = storeReport?.store || currentStore?.name || 'Magasin inconnu';

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading={`Rapport - ${storeName}`}
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Rapports',
            href: paths.dashboard.report.root,
          },
          {
            name: 'Vue d\'ensemble',
            href: paths.dashboard.report.overview,
          },
          { name: storeName },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={handleBackToOverview}
            >
              Retour
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:download-fill" />}
              onClick={handleExportPDF}
              disabled={!storeReport}
            >
              Exporter PDF
            </Button>
          </Stack>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {/* Filtres */}
      <Card sx={{ p: 3, mb: 3 }}>
        <ReportFilters onFiltersChange={handleFiltersChange} showStoreFilter={false} />
      </Card>

      {/* Affichage des erreurs */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Affichage si pas de filtres valides */}
      {!filtersValid && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Veuillez sélectionner une période valide pour afficher les données.
        </Alert>
      )}

      {/* Contenu principal */}
      {storeReport && (
        <>
          {/* En-tête avec informations du magasin */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid xs={12} md={8}>
                <Stack spacing={1}>
                  <Typography variant="h4">
                    {storeName}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Période: {filters.startDate && filters.endDate && 
                      formatPeriod(filters.startDate, filters.endDate)}
                  </Typography>
                  {currentStore && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {currentStore.contact?.address?.city}, {currentStore.contact?.address?.country}
                    </Typography>
                  )}
                </Stack>
              </Grid>
              <Grid xs={12} md={4}>
                <Box
                  sx={{
                    textAlign: { xs: 'left', md: 'right' },
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                    Statut du magasin
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: currentStore?.is_active ? 'success.main' : 'error.main',
                      fontWeight: 'bold' 
                    }}
                  >
                    {currentStore?.is_active ? 'Actif' : 'Inactif'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* Widgets de métriques */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid xs={12} sm={6} md={4}>
              <RevenueWidget
                value={storeReport.revenue}
                // percent={15} // TODO: Calculer le pourcentage vs période précédente
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <OrdersWidget
                value={storeReport.orders}
                // percent={8}
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <AverageOrderWidget
                value={storeReport.averageOrder}
                // percent={-3}
              />
            </Grid>
          </Grid>

          {/* Tableau des produits les plus vendus */}
          <Grid container spacing={3}>
            <Grid xs={12}>
              <TopProductsTable
                data={storeReport.topProducts}
                subheader={`${storeReport.topProducts.length} produit(s) vendu(s) sur la période`}
              />
            </Grid>
          </Grid>

          {/* Statistiques détaillées */}
          <Card sx={{ mt: 3, p: 3 }}>
            <CardHeader
              title="Statistiques détaillées"
              subheader="Analyses complémentaires"
            />
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid xs={12} sm={6} md={3}>
                <Stack alignItems="center" spacing={1}>
                  <Iconify icon="eva:shopping-cart-fill" width={32} sx={{ color: 'info.main' }} />
                  <Typography variant="h6">
                    {storeReport.orders}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Commandes totales
                  </Typography>
                </Stack>
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Stack alignItems="center" spacing={1}>
                  <Iconify icon="eva:trending-up-fill" width={32} sx={{ color: 'success.main' }} />
                  <Typography variant="h6">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XOF',
                      minimumFractionDigits: 0,
                    }).format(storeReport.revenue)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Chiffre d'affaires
                  </Typography>
                </Stack>
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Stack alignItems="center" spacing={1}>
                  <Iconify icon="eva:bar-chart-fill" width={32} sx={{ color: 'warning.main' }} />
                  <Typography variant="h6">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XOF',
                      minimumFractionDigits: 0,
                    }).format(storeReport.averageOrder)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Panier moyen
                  </Typography>
                </Stack>
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Stack alignItems="center" spacing={1}>
                  <Iconify icon="eva:cube-fill" width={32} sx={{ color: 'primary.main' }} />
                  <Typography variant="h6">
                    {storeReport.topProducts.reduce((total, product) => total + product.totalSold, 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Produits vendus
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Card>

          {/* Actions rapides */}
          <Card sx={{ mt: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions rapides
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:edit-fill" />}
                onClick={() => router.push(paths.dashboard.store.edit(storeId))}
              >
                Modifier le magasin
              </Button>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:people-fill" />}
                onClick={() => router.push(paths.dashboard.employee.root)}
              >
                Gérer les employés
              </Button>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:cube-fill" />}
                onClick={() => router.push(paths.dashboard.product.root)}
              >
                Gérer les produits
              </Button>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:refresh-fill" />}
                onClick={handleLoadData}
                disabled={loading}
              >
                Actualiser
              </Button>
            </Stack>
          </Card>
        </>
      )}
    </Container>
  );
}
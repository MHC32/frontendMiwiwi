// src/sections/report/view/report-overview-view.tsx
import { useEffect, useCallback, useState } from 'react';
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
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
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
  selectOwnerOverview,
  selectReportLoading,
  selectReportError,
  selectReportFilters,
  selectFiltersValid,
  selectReportMetrics,
  fetchOwnerOverview,
  initializeReportFilters,
} from 'src/redux/slices/report.slice';
import { fetchStores } from 'src/redux/slices/store.slice';
//
import ReportFilters from '../report-filters';
import { RevenueWidget, OrdersWidget, AverageOrderWidget, StoresWidget } from '../report-widget';
import SalesByStoreChart from '../sales-by-store-chart';

// ----------------------------------------------------------------------

export default function ReportOverviewView() {
  const router = useRouter();
  const settings = useSettingsContext();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [chartType, setChartType] = useState<'bar' | 'pie' | 'donut'>('bar');

  const overview = useSelector(selectOwnerOverview);
  const loading = useSelector(selectReportLoading);
  const error = useSelector(selectReportError);
  const filters = useSelector(selectReportFilters);
  const filtersValid = useSelector(selectFiltersValid);
  const metrics = useSelector(selectReportMetrics);

  // Initialisation
  useEffect(() => {
    dispatch(initializeReportFilters('month'));
    dispatch(fetchStores({ is_active: true }));
  }, [dispatch]);

  // Chargement automatique quand les filtres sont valides
  useEffect(() => {
    if (filtersValid) {
      handleLoadData();
    }
  }, [filtersValid, filters.startDate, filters.endDate]);

  const handleLoadData = useCallback(async () => {
    try {
      await dispatch(fetchOwnerOverview());
    } catch (error) {
      enqueueSnackbar(
        error?.message || 'Erreur lors du chargement des données',
        { variant: 'error' }
      );
    }
  }, [dispatch, enqueueSnackbar]);

  const handleStoreClick = useCallback((storeId: string) => {
    router.push(paths.dashboard.report.store(storeId));
  }, [router]);

  const handleFiltersChange = useCallback(() => {
    if (filtersValid) {
      handleLoadData();
    }
  }, [filtersValid, handleLoadData]);

  const handleExportPDF = useCallback(async () => {
    try {
      // TODO: Implémenter l'export PDF
      enqueueSnackbar('Export PDF en cours de développement', { variant: 'info' });
    } catch (error) {
      enqueueSnackbar('Erreur lors de l\'export', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  if (loading && !overview) {
    return <LoadingScreen />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Rapports - Vue d'ensemble"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Rapports',
            href: paths.dashboard.report.root,
          },
          { name: 'Vue d\'ensemble' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:download-fill" />}
            onClick={handleExportPDF}
            disabled={!overview}
          >
            Exporter PDF
          </Button>
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
      {overview && (
        <>
          {/* En-tête avec période */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <div>
                <Typography variant="h4" gutterBottom>
                  Rapport de performance
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Période: {filters.startDate && filters.endDate && 
                    formatPeriod(filters.startDate, filters.endDate)}
                </Typography>
              </div>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant={chartType === 'bar' ? 'contained' : 'outlined'}
                  onClick={() => setChartType('bar')}
                >
                  <Iconify icon="eva:bar-chart-fill" />
                </Button>
                <Button
                  size="small"
                  variant={chartType === 'pie' ? 'contained' : 'outlined'}
                  onClick={() => setChartType('pie')}
                >
                  <Iconify icon="eva:pie-chart-fill" />
                </Button>
                <Button
                  size="small"
                  variant={chartType === 'donut' ? 'contained' : 'outlined'}
                  onClick={() => setChartType('donut')}
                >
                  <Iconify icon="eva:radio-button-on-fill" />
                </Button>
              </Stack>
            </Stack>
          </Card>

          {/* Widgets de métriques */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid xs={12} sm={6} md={3}>
              <RevenueWidget
                value={metrics?.totalRevenue || 0}
                // percent={10} // TODO: Calculer le pourcentage vs période précédente
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <OrdersWidget
                value={metrics?.totalOrders || 0}
                // percent={5}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <AverageOrderWidget
                value={metrics?.averageOrderValue || 0}
                // percent={-2}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StoresWidget
                value={overview.stores.length}
              />
            </Grid>
          </Grid>

          {/* Graphique des ventes par magasin */}
          <Grid container spacing={3}>
            <Grid xs={12} lg={8}>
              <SalesByStoreChart
                data={overview.stores}
                chartType={chartType}
                subheader={`${overview.stores.length} magasin(s) actif(s)`}
              />
            </Grid>

            {/* Résumé du top store */}
            <Grid xs={12} lg={4}>
              <Card>
                <CardHeader
                  title="Meilleur magasin"
                  subheader="Performance sur la période"
                />
                {metrics?.topStore ? (
                  <Stack spacing={3} sx={{ p: 3 }}>
                    <Stack spacing={1}>
                      <Typography variant="h6">
                        {metrics.topStore.name}
                      </Typography>
                      <Typography variant="h4" sx={{ color: 'success.main' }}>
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'XOF',
                          minimumFractionDigits: 0,
                        }).format(metrics.topStore.revenue)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        de chiffre d'affaires
                      </Typography>
                    </Stack>

                    <Button
                      variant="outlined"
                      fullWidth
                      endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                      onClick={() => {
                        const topStoreData = overview.stores.find(
                          store => store.storeInfo[0]?.name === metrics.topStore?.name
                        );
                        if (topStoreData) {
                          handleStoreClick(topStoreData._id);
                        }
                      }}
                    >
                      Voir le détail
                    </Button>
                  </Stack>
                ) : (
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{ height: 200, color: 'text.secondary' }}
                  >
                    <Iconify icon="eva:info-outline" width={48} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Aucune donnée disponible
                    </Typography>
                  </Stack>
                )}
              </Card>
            </Grid>
          </Grid>

          {/* Actions rapides */}
          <Card sx={{ mt: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions rapides
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:eye-fill" />}
                onClick={() => router.push(paths.dashboard.report.analytics)}
              >
                Analyses détaillées
              </Button>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:calendar-fill" />}
                onClick={() => {
                  // TODO: Ouvrir sélecteur de période personnalisée
                }}
              >
                Période personnalisée
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
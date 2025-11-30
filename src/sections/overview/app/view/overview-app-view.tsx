// src/sections/owner/view/owner-dashboard-view.tsx

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// @mui
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// components
import { useSettingsContext } from 'src/components/settings';
// redux
import {
  loadInitialDashboardData,
  selectDailyStats,
  selectSalesByProduct,
  selectSalesByMonth,
  selectIsAnyLoading,
} from 'src/redux/slices/ownerDashboardSlice';
// sections
import AppWidgetSummary from '../app-widget-summary';
import AppCurrentDownload from '../app-current-download';
import AppAreaInstalled from '../app-area-installed';

// ----------------------------------------------------------------------

export default function OwnerDashboardView() {
  const { user } = useMockedUser();
  const theme = useTheme();
  const settings = useSettingsContext();
  const dispatch = useDispatch();

  // Selectors Redux
  const dailyStats = useSelector(selectDailyStats);
  const salesByProduct = useSelector(selectSalesByProduct);
  const salesByMonth = useSelector(selectSalesByMonth);
  const isLoading = useSelector(selectIsAnyLoading);

  // Charger les données au montage
  useEffect(() => {
    dispatch(loadInitialDashboardData() as any);
  }, [dispatch]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        
        {/* Card 1 : Ventes du jour */}
        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Ventes du jour"
            percent={dailyStats ? parseFloat(dailyStats.dailySales.variation) : 0}
            total={dailyStats ? parseFloat(dailyStats.dailySales.amount) : 0}
            chart={{
              series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
            }}
          />
        </Grid>

        {/* Card 2 : Tickets créés */}
        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Tickets créés"
            percent={dailyStats ? parseFloat(dailyStats.dailyTickets.variation) : 0}
            total={dailyStats?.dailyTickets.count || 0}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
            }}
          />
        </Grid>

        {/* Card 3 : Caissiers connectés */}
        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Caissiers connectés"
            percent={0}
            total={dailyStats?.connectedCashiers.count || 0}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
            }}
          />
        </Grid>

        {/* Graphique Donut : Ventes par produit */}
        <Grid xs={12} md={6} lg={4}>
          <AppCurrentDownload
            title="Ventes par produit"
            chart={{
              series: salesByProduct ? 
                salesByProduct.products.map(product => ({
                  label: product.name,
                  value: product.value,
                }))
                :
                []
            }}
          />
        </Grid>

        {/* Graphique Area : Ventes mensuelles */}
        <Grid xs={12} md={6} lg={8}>
          <AppAreaInstalled
            title="Ventes de l'année"
            subheader={salesByMonth ? 
              `(+${salesByMonth.summary.yearOverYearGrowth}%) vs année précédente` 
              : 
              ''
            }
            chart={{
              categories: salesByMonth ? 
                salesByMonth.monthlyData.map(m => m.month)
                :
                ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
              series: salesByMonth ? 
                [
                  {
                    year: salesByMonth.year.toString(),
                    data: [
                      {
                        name: 'Ventes',
                        data: salesByMonth.monthlyData.map(m => m.sales),
                      },
                      {
                        name: 'Commandes',
                        data: salesByMonth.monthlyData.map(m => m.orders),
                      },
                    ],
                  },
                ]
                :
                []
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
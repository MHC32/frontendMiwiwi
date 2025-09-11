// src/sections/report/sales-by-store-chart.tsx
import { ApexOptions } from 'apexcharts';
// @mui
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
// components
import Chart, { useChart } from 'src/components/chart';
import Iconify from 'src/components/iconify';
// types
import { IStoreReportInfo } from 'src/types/report';
// utils
import { fCurrency, fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  subheader?: string;
  data: IStoreReportInfo[];
  chartType?: 'bar' | 'pie' | 'donut';
};

export default function SalesByStoreChart({
  title = 'Ventes par magasin',
  subheader,
  data,
  chartType = 'bar',
  ...other
}: Props) {
  const theme = useTheme();

  // Préparer les données pour le graphique
  const chartData = data.map((store) => ({
    name: store.storeInfo[0]?.name || 'N/A',
    revenue: store.revenue,
    orders: store.orders,
  }));

  const chartLabels = chartData.map((item) => item.name);
  const chartSeries = chartData.map((item) => item.revenue);

  const chartOptions = useChart({
    chart: {
      type: chartType,
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.secondary.main,
    ],
    labels: chartLabels,
    legend: {
      position: chartType === 'bar' ? 'top' : 'bottom',
      horizontalAlign: 'center',
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '60%',
      },
      pie: {
        donut: {
          size: chartType === 'donut' ? '70%' : '0%',
        },
      },
    },
    xaxis: {
      categories: chartLabels,
    },
    yaxis: {
      labels: {
        formatter: (value: number) => fCurrency(value),
      },
    },
    tooltip: {
      y: {
        formatter: (value: number, { seriesIndex }: any) => {
          const storeData = chartData[seriesIndex];
          return `
            CA: ${fCurrency(value)}<br/>
            Commandes: ${fNumber(storeData?.orders || 0)}
          `;
        },
      },
    },
    dataLabels: {
      enabled: chartType !== 'bar',
      formatter: (val: number) => `${Number(val).toFixed(1)}%`,
    },
  });

  const renderLegend = chartType !== 'bar' && (
    <Stack spacing={2} sx={{ p: 3, pt: 0 }}>
      {chartData.map((store, index) => (
        <Stack key={store.name} direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 16,
              height: 16,
              bgcolor: chartOptions.colors?.[index] || theme.palette.grey[500],
              borderRadius: 0.75,
              flexShrink: 0,
            }}
          />
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            {store.name}
          </Typography>
          <Stack alignItems="flex-end" spacing={0.5}>
            <Typography variant="subtitle2">
              {fCurrency(store.revenue)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {fNumber(store.orders)} commandes
            </Typography>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );

  const totalRevenue = chartData.reduce((sum, store) => sum + store.revenue, 0);
  const totalOrders = chartData.reduce((sum, store) => sum + store.orders, 0);

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack alignItems="center">
              <Typography variant="h6">{fCurrency(totalRevenue)}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                CA Total
              </Typography>
            </Stack>
            <Stack alignItems="center">
              <Typography variant="h6">{fNumber(totalOrders)}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Commandes
              </Typography>
            </Stack>
          </Stack>
        }
      />

      {chartData.length > 0 ? (
        <>
          <Box sx={{ mt: 3, mx: 3 }}>
            <Chart
              type={chartType}
              series={
                chartType === 'bar'
                  ? [{ name: 'Chiffre d\'affaires', data: chartSeries }]
                  : chartSeries
              }
              options={chartOptions}
              height={364}
            />
          </Box>

          {renderLegend}
        </>
      ) : (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ height: 364, color: 'text.secondary' }}
        >
          <Iconify icon="eva:file-text-outline" width={64} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Aucune donnée disponible
          </Typography>
        </Stack>
      )}
    </Card>
  );
}
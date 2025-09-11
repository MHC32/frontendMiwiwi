// src/sections/report/report-widget.tsx
import { ApexOptions } from 'apexcharts';
// @mui
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
// components
import Chart, { useChart } from 'src/components/chart';
import Iconify from 'src/components/iconify';
// utils
import { fNumber, fCurrency, fPercent } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  value: number;
  icon: string;
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  percent?: number;
  chart?: {
    categories: string[];
    series: number[];
  };
  currency?: boolean;
};

export default function ReportWidget({
  title,
  value,
  icon,
  color = 'primary',
  percent,
  chart,
  currency = false,
  ...other
}: Props) {
  const theme = useTheme();

  const chartOptions = useChart({
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    xaxis: {
      categories: chart?.categories,
    },
    colors: [theme.palette[color].main],
    tooltip: {
      marker: { show: false },
      y: {
        formatter: (value: number) => currency ? fCurrency(value) : fNumber(value),
        title: {
          formatter: () => '',
        },
      },
    },
  });

  const renderTrend = percent !== undefined && (
    <Stack direction="row" alignItems="center" sx={{ mt: 2, mb: 1 }}>
      <Iconify
        icon={percent < 0 ? 'eva:trending-down-fill' : 'eva:trending-up-fill'}
        sx={{
          mr: 1,
          p: 0.5,
          width: 24,
          height: 24,
          borderRadius: '50%',
          color: percent < 0 ? 'error.main' : 'success.main',
          bgcolor: percent < 0 ? 'error.lighter' : 'success.lighter',
        }}
      />
      <Typography variant="subtitle2" component="div" noWrap>
        {percent > 0 && '+'}
        {fPercent(percent)}
        <Typography
          variant="body2"
          component="span"
          sx={{ color: 'text.secondary', typography: 'body2' }}
        >
          {' vs période précédente'}
        </Typography>
      </Typography>
    </Stack>
  );

  return (
    <Card {...other}>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify
              icon={icon}
              sx={{
                width: 24,
                height: 24,
                color: `${color}.main`,
              }}
            />
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              {title}
            </Typography>
          </Stack>
        }
        sx={{ pb: 1 }}
      />

      <Stack spacing={1} sx={{ p: 3, pt: 0 }}>
        <Typography variant="h3">
          {currency ? fCurrency(value) : fNumber(value)}
        </Typography>

        {renderTrend}

        {chart && (
          <Chart
            type="area"
            series={[{ data: chart.series }]}
            options={chartOptions}
            height={60}
          />
        )}
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

// Composant spécialisé pour le chiffre d'affaires
export function RevenueWidget({ value, percent, chart, ...other }: Omit<Props, 'title' | 'icon' | 'currency'>) {
  return (
    <ReportWidget
      title="Chiffre d'affaires"
      value={value}
      icon="eva:trending-up-fill"
      color="success"
      currency
      percent={percent}
      chart={chart}
      {...other}
    />
  );
}

// Composant spécialisé pour le nombre de commandes
export function OrdersWidget({ value, percent, chart, ...other }: Omit<Props, 'title' | 'icon' | 'currency'>) {
  return (
    <ReportWidget
      title="Nombre de commandes"
      value={value}
      icon="eva:shopping-cart-fill"
      color="info"
      percent={percent}
      chart={chart}
      {...other}
    />
  );
}

// Composant spécialisé pour le panier moyen
export function AverageOrderWidget({ value, percent, chart, ...other }: Omit<Props, 'title' | 'icon' | 'currency'>) {
  return (
    <ReportWidget
      title="Panier moyen"
      value={value}
      icon="eva:bar-chart-fill"
      color="warning"
      currency
      percent={percent}
      chart={chart}
      {...other}
    />
  );
}

// Composant spécialisé pour le nombre de magasins
export function StoresWidget({ value, ...other }: Omit<Props, 'title' | 'icon' | 'currency' | 'percent'>) {
  return (
    <ReportWidget
      title="Magasins actifs"
      value={value}
      icon="eva:home-fill"
      color="primary"
      {...other}
    />
  );
}
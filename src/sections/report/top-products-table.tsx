// src/sections/report/top-products-table.tsx
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
// components
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
// types
import { ITopProduct } from 'src/types/report';
// utils
import { fCurrency, fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  subheader?: string;
  data: ITopProduct[];
  maxItems?: number;
};

export default function TopProductsTable({
  title = 'Produits les plus vendus',
  subheader,
  data,
  maxItems = 10,
  ...other
}: Props) {
  const displayData = data.slice(0, maxItems);

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell>Rang</TableCell>
                <TableCell>Produit</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell align="center">Quantité vendue</TableCell>
                <TableCell align="right">Chiffre d'affaires</TableCell>
                <TableCell align="right">Part du CA</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {displayData.length > 0 ? (
                displayData.map((product, index) => {
                  const productInfo = product.productInfo[0];
                  const totalRevenue = data.reduce((sum, p) => sum + p.revenue, 0);
                  const revenuePercentage = totalRevenue > 0 ? (product.revenue / totalRevenue) * 100 : 0;

                  return (
                    <TopProductsTableRow
                      key={product._id}
                      rank={index + 1}
                      product={productInfo}
                      totalSold={product.totalSold}
                      revenue={product.revenue}
                      percentage={revenuePercentage}
                    />
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Stack alignItems="center" spacing={2}>
                      <Iconify icon="eva:file-text-outline" width={64} sx={{ color: 'text.disabled' }} />
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Aucun produit vendu sur cette période
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}

// ----------------------------------------------------------------------

type TopProductsTableRowProps = {
  rank: number;
  product: {
    _id: string;
    name: string;
    price: number;
    category_id?: {
      name: string;
    };
  };
  totalSold: number;
  revenue: number;
  percentage: number;
};

function TopProductsTableRow({
  rank,
  product,
  totalSold,
  revenue,
  percentage,
}: TopProductsTableRowProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'warning'; // Gold
    if (rank === 2) return 'default'; // Silver
    if (rank === 3) return 'error'; // Bronze
    return 'default';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return 'eva:award-fill';
    return 'eva:hash-outline';
  };

  return (
    <TableRow hover>
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: `${getRankColor(rank)}.lighter`,
              color: `${getRankColor(rank)}.darker`,
            }}
          >
            <Iconify icon={getRankIcon(rank)} width={20} />
          </Avatar>
          <Typography variant="subtitle2">#{rank}</Typography>
        </Stack>
      </TableCell>

      <TableCell>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" noWrap>
            {product.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            Prix: {fCurrency(product.price)}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>
        {product.category_id?.name ? (
          <Chip
            label={product.category_id.name}
            size="small"
            variant="soft"
            color="info"
          />
        ) : (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            Non catégorisé
          </Typography>
        )}
      </TableCell>

      <TableCell align="center">
        <Stack alignItems="center" spacing={0.5}>
          <Typography variant="subtitle2">
            {fNumber(totalSold)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            unités
          </Typography>
        </Stack>
      </TableCell>

      <TableCell align="right">
        <Typography variant="subtitle2">
          {fCurrency(revenue)}
        </Typography>
      </TableCell>

      <TableCell align="right">
        <Stack alignItems="flex-end" spacing={0.5}>
          <Typography variant="subtitle2" sx={{ color: 'success.main' }}>
            {percentage.toFixed(1)}%
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            du CA total
          </Typography>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
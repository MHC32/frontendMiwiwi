// src/sections/category/category-table-filters-result.tsx
import { useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';
// types

// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

interface ICategoryTableFilters {
  name: string;
  status: 'all' | 'active' | 'inactive';
  parentFilter: 'all' | 'root' | 'children';
  storeId: string;
}

type Props = StackProps & {
  filters: ICategoryTableFilters;
  onFilters: (name: string, value: any) => void;
  onResetFilters: VoidFunction;
  results: number;
};

export default function CategoryTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  ...other
}: Props) {
  const handleRemoveKeyword = useCallback(() => {
    onFilters('name', '');
  }, [onFilters]);

  const handleRemoveStatus = useCallback(() => {
    onFilters('status', 'all');
  }, [onFilters]);

  const handleRemoveParentFilter = useCallback(() => {
    onFilters('parentFilter', 'all');
  }, [onFilters]);

  const handleRemoveStore = useCallback(() => {
    onFilters('storeId', '');
  }, [onFilters]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actives';
      case 'inactive':
        return 'Inactives';
      default:
        return 'Toutes';
    }
  };

  const getParentFilterLabel = (filter: string) => {
    switch (filter) {
      case 'root':
        return 'Catégories racines';
      case 'children':
        return 'Sous-catégories';
      default:
        return 'Toutes';
    }
  };

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          résultat(s) trouvé(s)
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.status !== 'all' && (
          <Block label="Statut:">
            <Chip
              size="small"
              label={getStatusLabel(filters.status)}
              onDelete={handleRemoveStatus}
              deleteIcon={<Iconify icon="mingcute:close-line" />}
            />
          </Block>
        )}

        {filters.parentFilter !== 'all' && (
          <Block label="Type:">
            <Chip
              size="small"
              label={getParentFilterLabel(filters.parentFilter)}
              onDelete={handleRemoveParentFilter}
              deleteIcon={<Iconify icon="mingcute:close-line" />}
            />
          </Block>
        )}

        {!!filters.storeId && (
          <Block label="Magasin:">
            <Chip
              size="small"
              label={filters.storeId}
              onDelete={handleRemoveStore}
              deleteIcon={<Iconify icon="mingcute:close-line" />}
            />
          </Block>
        )}

        {!!filters.name && (
          <Block label="Recherche:">
            <Chip
              size="small"
              label={filters.name}
              onDelete={handleRemoveKeyword}
              deleteIcon={<Iconify icon="mingcute:close-line" />}
            />
          </Block>
        )}

        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Effacer tout
        </Button>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

type BlockProps = {
  label: string;
  children: React.ReactNode;
};

function Block({ label, children }: BlockProps) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
      }}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}
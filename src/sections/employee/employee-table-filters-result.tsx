import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';
// components
import Iconify from 'src/components/iconify';
// types
import {IEmployeeTableFilters, IEmployeeTableFilterValue,} from 'src/types/employee';

// ----------------------------------------------------------------------

type Props = StackProps & {
  filters: IEmployeeTableFilters;
  onFilters: (name: string, value: IEmployeeTableFilterValue) => void;
  onResetFilters: VoidFunction;
  results: number;
};

export default function EmployeeTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  ...other
}: Props) {
  const handleRemoveStatus = () => {
    onFilters('is_active', 'all');
  };

  const handleRemoveRole = () => {
    onFilters('role', 'all');
  };

  const handleRemoveStore = (inputValue: string) => {
    const newValue = filters.store_id.filter((item) => item !== inputValue);
    onFilters('store_id', newValue);
  };

  const handleRemoveQuery = () => {
    onFilters('query', '');
  };

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          employé(s) trouvé(s)
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.is_active !== 'all' && (
          <Block label="Statut:">
            <Chip
              size="small"
              label={filters.is_active === 'active' ? 'Actif' : 'Inactif'}
              onDelete={handleRemoveStatus}
            />
          </Block>
        )}

        {filters.role !== 'all' && (
          <Block label="Rôle:">
            <Chip
              size="small"
              label={filters.role === 'cashier' ? 'Caissier' : 'Superviseur'}
              onDelete={handleRemoveRole}
            />
          </Block>
        )}

        {!!filters.store_id.length && (
          <Block label="Magasin:">
            {filters.store_id.map((item) => (
              <Chip 
                key={item} 
                label={item} 
                size="small" 
                onDelete={() => handleRemoveStore(item)} 
              />
            ))}
          </Block>
        )}

        {filters.query && (
          <Block label="Recherche:">
            <Chip
              size="small"
              label={filters.query}
              onDelete={handleRemoveQuery}
            />
          </Block>
        )}

        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Réinitialiser
        </Button>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

type BlockProps = StackProps & {
  label: string;
};

function Block({ label, children, sx, ...other }: BlockProps) {
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
        ...sx,
      }}
      {...other}
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
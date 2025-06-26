import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';
// components
import Iconify from 'src/components/iconify';
// types
import { IStoreTableFilters, IStoreTableFilterValue } from 'src/types/store';

// ----------------------------------------------------------------------

type Props = StackProps & {
  filters: IStoreTableFilters;
  onFilters: (name: string, value: IStoreTableFilterValue) => void;
  onResetFilters: VoidFunction;
  results: number;
};

export default function StoreTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  ...other
}: Props) {
  const handleRemoveStatus = () => {
    onFilters('status', 'all');
  };

  const handleRemoveCity = (inputValue: string) => {
    const newValue = filters.city.filter((item) => item !== inputValue);
    onFilters('city', newValue);
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
              label={filters.status === 'active' ? 'Actif' : 'Inactif'}
              onDelete={handleRemoveStatus}
            />
          </Block>
        )}

        {!!filters.city.length && (
          <Block label="Ville:">
            {filters.city.map((item) => (
              <Chip 
                key={item} 
                label={item} 
                size="small" 
                onDelete={() => handleRemoveCity(item)} 
              />
            ))}
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
// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';
// types
import { ICompanyTableFilters, ICompanyTableFilterValue } from 'src/types/company';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = StackProps & {
  filters: ICompanyTableFilters;
  onFilters: (name: string, value: ICompanyTableFilterValue) => void;
  onResetFilters: VoidFunction;
  results: number;
  statusOptions: string[];
};

export default function CompanyTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  statusOptions,
  ...other
}: Props) {
  const handleRemoveStatus = (inputValue: string) => {
    const newValue = filters.status.filter((item) => item !== inputValue);
    onFilters('status', newValue.length > 0 ? newValue : statusOptions); // Retourne tous les statuts si vide
  };

  const handleRemoveName = () => {
    onFilters('name', '');
  };

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          résultats trouvés
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.name && (
          <Block label="Nom:">
            <Chip size="small" label={filters.name} onDelete={handleRemoveName} />
          </Block>
        )}

        {filters.status.length > 0 && filters.status.length < statusOptions.length && (
          <Block label="Statut:">
            {filters.status.map((item) => (
              <Chip 
                key={item} 
                label={item} 
                size="small" 
                onDelete={() => handleRemoveStatus(item)} 
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
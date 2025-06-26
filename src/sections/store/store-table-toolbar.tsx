import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select, { SelectChangeEvent } from '@mui/material/Select';
// types
import { IStoreTableFilters, IStoreTableFilterValue } from 'src/types/store';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  filters: IStoreTableFilters;
  onFilters: (name: string, value: IStoreTableFilterValue) => void;
  cityOptions: string[];
  onRefresh: () => void;
};

export default function StoreTableToolbar({
  filters,
  onFilters,
  cityOptions,
  onRefresh,
}: Props) {
  const popover = usePopover();

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterCity = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      onFilters(
        'city',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  const handleFilterStatus = useCallback(
    (event: SelectChangeEvent<IStoreTableFilterValue>) => {
      onFilters('status', event.target.value as string);
    },
    [onFilters]
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>Ville</InputLabel>
          <Select
            multiple
            value={filters.city}
            onChange={handleFilterCity}
            input={<OutlinedInput label="Ville" />}
            renderValue={(selected) => selected.join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {cityOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox disableRipple size="small" checked={filters.city.includes(option)} />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 180 },
          }}
        >
          <InputLabel>Statut</InputLabel>
          <Select
            value={filters.status}
            onChange={handleFilterStatus}
            input={<OutlinedInput label="Statut" />}
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="active">Actif</MenuItem>
            <MenuItem value="inactive">Inactif</MenuItem>
          </Select>
        </FormControl>

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            placeholder="Rechercher un magasin..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <IconButton onClick={onRefresh}>
            <Iconify icon="eva:refresh-fill" />
          </IconButton>

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            // Implémenter l'export
          }}
        >
          <Iconify icon="solar:export-bold" />
          Exporter
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            // Implémenter l'impression
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Imprimer
        </MenuItem>
      </CustomPopover>
    </>
  );
}
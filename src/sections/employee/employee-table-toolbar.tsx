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
import { IEmployeeTableFilters, IEmployeeTableFilterValue } from 'src/types/employee';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  filters: IEmployeeTableFilters;
  onFilters: (name: string, value: IEmployeeTableFilterValue) => void;
  storeOptions: string[];
  onRefresh: () => void;
};

export default function EmployeeTableToolbar({
  filters,
  onFilters,
  storeOptions,
  onRefresh,
}: Props) {
  const popover = usePopover();

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStore = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      onFilters(
        'store_id',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  const handleFilterStatus = useCallback(
    (event: SelectChangeEvent<IEmployeeTableFilterValue>) => {
      onFilters('is_active', event.target.value as string);
    },
    [onFilters]
  );

  const handleFilterRole = useCallback(
    (event: SelectChangeEvent<IEmployeeTableFilterValue>) => {
      onFilters('role', event.target.value as string);
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
          <InputLabel>Magasin</InputLabel>
          <Select
            multiple
            value={filters.store_id}
            onChange={handleFilterStore}
            input={<OutlinedInput label="Magasin" />}
            renderValue={(selected) => selected.join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {storeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox disableRipple size="small" checked={filters.store_id.includes(option)} />
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
          <InputLabel>Rôle</InputLabel>
          <Select
            value={filters.role}
            onChange={handleFilterRole}
            input={<OutlinedInput label="Rôle" />}
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="cashier">Caissier</MenuItem>
            <MenuItem value="supervisor">Superviseur</MenuItem>
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
            value={filters.is_active}
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
            placeholder="Rechercher un employé..."
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
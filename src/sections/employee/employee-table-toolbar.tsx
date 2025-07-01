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
import { IEmployeeTableFilters, IEmployeeTableFilterValue, EmployeeRoleFilter, EmployeeStatusFilter } from 'src/types/employee';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type StoreOption = {
  id: string;
  name: string;
};

type Props = {
  filters: IEmployeeTableFilters;
  onFilters: (name: string, value: IEmployeeTableFilterValue) => void;
  storeOptions: StoreOption[];
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
    (event: SelectChangeEvent<EmployeeStatusFilter>) => {
      onFilters('is_active', event.target.value as EmployeeStatusFilter);
    },
    [onFilters]
  );

  const handleFilterRole = useCallback(
    (event: SelectChangeEvent<EmployeeRoleFilter>) => {
      onFilters('role', event.target.value as EmployeeRoleFilter);
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
        {/* Magasin Select */}
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
            renderValue={(selected) => {
              const selectedStores = selected.map(id => 
                storeOptions.find(store => store.id === id)?.name || id
              );
              return selectedStores.join(', ');
            }}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {storeOptions.map((store) => (
              <MenuItem key={store.id} value={store.id}>
                <Checkbox 
                  disableRipple 
                  size="small" 
                  checked={filters.store_id.includes(store.id)} 
                />
                {store.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Rôle Select */}
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

        {/* Statut Select */}
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

        {/* Search Field */}
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

      {/* Options Popover */}
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
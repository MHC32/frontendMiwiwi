// src/sections/category/category-table-toolbar.tsx
import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete from '@mui/material/Autocomplete';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { AutocompleteChangeReason } from '@mui/material/Autocomplete';
// types

// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------


interface ICategoryTableFilters {
  name: string;
  status: 'all' | 'active' | 'inactive';
  parentFilter: 'all' | 'root' | 'children';
  storeId: string;
}


type Props = {
  filters: ICategoryTableFilters;
  onFilters: (name: string, value: any) => void;
  stores: Array<{ value: string; label: string }>;
};

export default function CategoryTableToolbar({ filters, onFilters, stores }: Props) {
  const popover = usePopover();

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStore = useCallback(
    (
      event: React.SyntheticEvent,
      value: { value: string; label: string } | null,
      reason: AutocompleteChangeReason
    ) => {
      onFilters('storeId', value?.value || '');
    },
    [onFilters]
  );

  const handleFilterParent = useCallback(
    (event: SelectChangeEvent<'all' | 'root' | 'children'>) => {
      onFilters('parentFilter', event.target.value as 'all' | 'root' | 'children');
    },
    [onFilters]
  );

  const handleFilterStatus = useCallback(
    (event: SelectChangeEvent<'all' | 'active' | 'inactive'>) => {
      onFilters('status', event.target.value as 'all' | 'active' | 'inactive');
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
        {/* Filtre par type de catégorie */}
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>Type</InputLabel>
          <Select
            value={filters.parentFilter}
            onChange={handleFilterParent}
            input={<OutlinedInput label="Type" />}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            <MenuItem value="all">Toutes</MenuItem>
            <MenuItem value="root">Racines</MenuItem>
            <MenuItem value="children">Sous-catégories</MenuItem>
          </Select>
        </FormControl>

        {/* Filtre par statut */}
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>Statut</InputLabel>
          <Select
            value={filters.status}
            onChange={handleFilterStatus}
            input={<OutlinedInput label="Statut" />}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="active">Actives</MenuItem>
            <MenuItem value="inactive">Inactives</MenuItem>
          </Select>
        </FormControl>

        {/* Filtre par magasin */}
        <Autocomplete
          sx={{
            width: { xs: 1, md: 240 },
          }}
          options={stores}
          value={stores.find(store => store.value === filters.storeId) || null}
          onChange={handleFilterStore}
          getOptionLabel={(option) => option.label}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Magasin"
              placeholder="Filtrer par magasin..."
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:pin-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        {/* Recherche par nom */}
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            placeholder="Rechercher une catégorie..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <Tooltip title="Plus de filtres">
            <IconButton onClick={popover.onOpen}>
              <Iconify icon="ic:round-filter-list" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Popover des actions supplémentaires */}
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            // Logique d'impression
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" width={20} sx={{ mr: 1 }} />
          Imprimer
        </MenuItem>

        <MenuItem
          onClick={() => {
            // Logique d'import
            popover.onClose();
          }}
        >
          <Iconify icon="solar:import-bold" width={20} sx={{ mr: 1 }} />
          Importer
        </MenuItem>

        <MenuItem
          onClick={() => {
            // Logique d'export
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" width={20} sx={{ mr: 1 }} />
          Exporter
        </MenuItem>

        <MenuItem
          onClick={() => {
            // Réinitialiser les filtres
            onFilters('name', '');
            onFilters('status', 'all');
            onFilters('parentFilter', 'all');
            onFilters('storeId', '');
            popover.onClose();
          }}
        >
          <Iconify icon="solar:restart-bold" width={20} sx={{ mr: 1 }} />
          Réinitialiser
        </MenuItem>
      </CustomPopover>
    </>
  );
}
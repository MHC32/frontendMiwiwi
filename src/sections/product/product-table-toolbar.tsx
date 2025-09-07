import { useCallback, useState, useEffect } from 'react';
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
import { IProductTableFilters, IProductTableFilterValue } from 'src/types/product';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
// requests
import { storeRequests, categoryRequests } from 'src/utils/request';

// ----------------------------------------------------------------------

type Props = {
  filters: IProductTableFilters;
  onFilters: (name: string, value: IProductTableFilterValue) => void;
  onRefresh?: VoidFunction;
};

export default function ProductTableToolbar({
  filters,
  onFilters,
  onRefresh,
}: Props) {
  const popover = usePopover();
  
  const [stores, setStores] = useState<Array<{ id: string; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);

  // Charger les magasins et catégories
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [storesResponse, categoriesResponse] = await Promise.all([
          storeRequests.getStores({ limit: 100, is_active: true }),
          categoryRequests.getCategories()
        ]);
        
        setStores(storesResponse.data.map(store => ({ id: store.id, name: store.name })));
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      }
    };

    fetchOptions();
  }, []);

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterType = useCallback(
    (event: SelectChangeEvent) => {
      onFilters('type', event.target.value);
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

  const handleFilterCategory = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      onFilters(
        'category_id',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
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
        {/* Filtre par Type */}
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 160 },
          }}
        >
          <InputLabel>Type</InputLabel>
          <Select
            value={filters.type}
            onChange={handleFilterType}
            input={<OutlinedInput label="Type" />}
          >
            <MenuItem value="all">Tous types</MenuItem>
            <MenuItem value="weight">Poids</MenuItem>
            <MenuItem value="fuel">Carburant</MenuItem>
            <MenuItem value="unit">Unité</MenuItem>
          </Select>
        </FormControl>

        {/* Filtre par Magasin */}
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
              if (selected.length === 0) return 'Tous les magasins';
              if (selected.length === 1) {
                const store = stores.find(s => s.id === selected[0]);
                return store?.name || selected[0];
              }
              return `${selected.length} magasins`;
            }}
          >
            {stores.map((store) => (
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

        {/* Filtre par Catégorie */}
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>Catégorie</InputLabel>
          <Select
            multiple
            value={filters.category_id}
            onChange={handleFilterCategory}
            input={<OutlinedInput label="Catégorie" />}
            renderValue={(selected) => {
              if (selected.length === 0) return 'Toutes catégories';
              if (selected.length === 1) {
                const category = categories.find(c => c._id === selected[0]);
                return category?.name || selected[0];
              }
              return `${selected.length} catégories`;
            }}
          >
            {categories.map((category) => (
              <MenuItem key={category._id} value={category._id}>
                <Checkbox 
                  disableRipple 
                  size="small" 
                  checked={filters.category_id.includes(category._id)} 
                />
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Barre de recherche */}
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            placeholder="Rechercher par nom ou code-barres..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

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
        {onRefresh && (
          <MenuItem
            onClick={() => {
              onRefresh();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:refresh-bold" />
            Actualiser
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Imprimer
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:import-bold" />
          Importer
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Exporter
        </MenuItem>
      </CustomPopover>
    </>
  );
}
// src/sections/meter-reading/meter-reading-table-toolbar.tsx (Version Responsive)
import { useCallback } from 'react';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Collapse from '@mui/material/Collapse';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Label from 'src/components/label';
// types
import { IMeterReadingTableFilters } from 'src/types/meter-reading';
import { IStoreItem } from 'src/types/store';

// ----------------------------------------------------------------------

type Props = {
  stores?: IStoreItem[];
  selectedStoreId?: string;
  onStoreChange?: (storeId: string) => void;
  filters: IMeterReadingTableFilters;
  onFilters: (name: string, value: any) => void;
  canReset: boolean;
  onResetFilters: VoidFunction;
};

export default function MeterReadingTableToolbar({
  stores = [],
  selectedStoreId,
  onStoreChange,
  filters,
  onFilters,
  canReset,
  onResetFilters,
}: Props) {
  const popover = usePopover();
  const moreFilters = useBoolean();

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStatus = useCallback(
    (event: SelectChangeEvent<string>) => {
      onFilters('status', event.target.value);
    },
    [onFilters]
  );

  const handleFilterType = useCallback(
    (event: SelectChangeEvent<string>) => {
      onFilters('type', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue: Date | null) => {
      onFilters('startDate', newValue);
    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue: Date | null) => {
      onFilters('endDate', newValue);
    },
    [onFilters]
  );

  const handleStoreSelect = useCallback(
    (event: SelectChangeEvent<string>) => {
      if (onStoreChange) {
        onStoreChange(event.target.value);
      }
    },
    [onStoreChange]
  );

  const selectedStore = stores.find(store => store.id === selectedStoreId);

  return (
    <Box sx={{ p: 2.5 }}>
      {/* 📱 LIGNE 1 : Sélection magasin + recherche (toujours visibles) */}
      <Stack
        spacing={2}
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{ mb: 2 }}
      >
        {/* Dropdown de sélection de magasin */}
        {stores.length > 0 && onStoreChange && (
          <FormControl
            sx={{
              minWidth: { xs: '100%', sm: 280, md: 320 },
              maxWidth: { xs: '100%', md: 400 },
            }}
          >
            <InputLabel>Sélectionner un magasin</InputLabel>
            <Select
              value={selectedStoreId || ''}
              onChange={handleStoreSelect}
              input={<OutlinedInput label="Sélectionner un magasin" />}
              renderValue={(value) => {
                const store = stores.find(s => s.id === value);
                if (!store) return '';
                
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={store.photo}
                      alt={store.name}
                      sx={{ width: 24, height: 24 }}
                    >
                      {store.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" noWrap>
                        {store.name}
                      </Typography>
                    </Box>
                    <Label 
                      variant="soft" 
                      color={store.is_active ? 'success' : 'error'}
                    >
                      {store.is_active ? 'Actif' : 'Inactif'}
                    </Label>
                  </Box>
                );
              }}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 300 },
                },
              }}
            >
              {stores.map((store) => (
                <MenuItem key={store.id} value={store.id}>
                  <Avatar
                    src={store.photo}
                    alt={store.name}
                    sx={{ width: 32, height: 32, mr: 2 }}
                  >
                    {store.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <ListItemText
                    primary={store.name}
                    secondary={store.contact.address.city}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Label 
                    variant="soft" 
                    color={store.is_active ? 'success' : 'error'}
                    sx={{ ml: 1 }}
                  >
                    {store.is_active ? 'Actif' : 'Inactif'}
                  </Label>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Champ de recherche */}
        <TextField
          fullWidth
          value={filters.name}
          onChange={handleFilterName}
          placeholder="Rechercher un caissier..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ 
            minWidth: { xs: '100%', md: 240 },
            maxWidth: { xs: '100%', md: 400 },
          }}
        />

        {/* Bouton filtres avancés (mobile) */}
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <IconButton 
            onClick={moreFilters.onToggle}
            sx={{ 
              display: { xs: 'flex', md: 'none' },
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Iconify icon="eva:options-2-fill" />
          </IconButton>

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>

      {/* 📱 LIGNE 2 : Filtres avancés (responsive) */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Grid container spacing={2} alignItems="center">
          {/* Filtre par statut */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Statut</InputLabel>
              <Select
                value={filters.status}
                onChange={handleFilterStatus}
                input={<OutlinedInput label="Statut" />}
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="verified">Vérifié</MenuItem>
                <MenuItem value="rejected">Rejeté</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Filtre par type */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={handleFilterType}
                input={<OutlinedInput label="Type" />}
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="opening">Ouverture</MenuItem>
                <MenuItem value="closing">Fermeture</MenuItem>
                <MenuItem value="daily">Quotidien</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Date de début */}
          <Grid item xs={12} sm={6} md={2.5}>
            <DatePicker
              label="Date début"
              value={filters.startDate}
              onChange={handleFilterStartDate}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
          </Grid>

          {/* Date de fin */}
          <Grid item xs={12} sm={6} md={2.5}>
            <DatePicker
              label="Date fin"
              value={filters.endDate}
              onChange={handleFilterEndDate}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
          </Grid>

          {/* Bouton de reset */}
          <Grid item xs={12} md={3}>
            {canReset && (
              <Button
                color="error"
                onClick={onResetFilters}
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                sx={{ height: 40 }}
              >
                Effacer
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* 📱 FILTRES MOBILES (Collapse) */}
      <Collapse in={moreFilters.value} sx={{ display: { md: 'none' } }}>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {/* Statut */}
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filters.status}
                  onChange={handleFilterStatus}
                  input={<OutlinedInput label="Statut" />}
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="verified">Vérifié</MenuItem>
                  <MenuItem value="rejected">Rejeté</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Type */}
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={handleFilterType}
                  input={<OutlinedInput label="Type" />}
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="opening">Ouverture</MenuItem>
                  <MenuItem value="closing">Fermeture</MenuItem>
                  <MenuItem value="daily">Quotidien</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Dates */}
            <Grid item xs={6}>
              <DatePicker
                label="Date début"
                value={filters.startDate}
                onChange={handleFilterStartDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>

            <Grid item xs={6}>
              <DatePicker
                label="Date fin"
                value={filters.endDate}
                onChange={handleFilterEndDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>

            {/* Reset */}
            {canReset && (
              <Grid item xs={12}>
                <Button
                  fullWidth
                  color="error"
                  onClick={onResetFilters}
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                >
                  Effacer les filtres
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
      </Collapse>

      {/* Menu contextuel */}
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
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
    </Box>
  );
}
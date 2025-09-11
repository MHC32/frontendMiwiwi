// src/sections/report/report-filters.tsx
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'src/redux/store';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// types
import { ReportPeriod, REPORT_PERIODS } from 'src/types/report';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from '../../components/custom-popover';
// redux
import { 
  selectReportFilters, 
  setPeriod,
  setDateRange,
  setSelectedStore,
  updateFiltersAndRefresh
} from 'src/redux/slices/report.slice';


import { selectStores } from 'src/redux/slices/store.slice';

// ----------------------------------------------------------------------

type Props = {
  onFiltersChange?: VoidFunction;
  showStoreFilter?: boolean;
};

export default function ReportFilters({ onFiltersChange, showStoreFilter = true }: Props) {
  const dispatch = useDispatch();
  const filters = useSelector(selectReportFilters);
  const stores = useSelector(selectStores);
  
  const popover = usePopover();

  const handleFilterPeriod = useCallback((newPeriod: ReportPeriod) => {
    dispatch(setPeriod(newPeriod));
    popover.onClose();
    onFiltersChange?.();
  }, [dispatch, onFiltersChange, popover]);

  const handleFilterStartDate = useCallback((newValue: Date | null) => {
    dispatch(setDateRange({ 
      startDate: newValue, 
      endDate: filters.endDate 
    }));
    onFiltersChange?.();
  }, [dispatch, filters.endDate, onFiltersChange]);

  const handleFilterEndDate = useCallback((newValue: Date | null) => {
    dispatch(setDateRange({ 
      startDate: filters.startDate, 
      endDate: newValue 
    }));
    onFiltersChange?.();
  }, [dispatch, filters.startDate, onFiltersChange]);

  const handleFilterStore = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const storeId = event.target.value;
    dispatch(setSelectedStore(storeId || null));
    onFiltersChange?.();
  }, [dispatch, onFiltersChange]);

  const handleRefresh = useCallback(() => {
    dispatch(updateFiltersAndRefresh(filters, true));
  }, [dispatch, filters]);

  const renderFilterPeriod = (
    <CustomPopover
      open={popover.open}
      onClose={popover.onClose}
      arrow="right-top"
      sx={{ width: 180 }}
    >
      <Stack spacing={0.5}>
        {Object.entries(REPORT_PERIODS).map(([value, label]) => (
          <MenuItem
            key={value}
            selected={filters.period === value}
            onClick={() => handleFilterPeriod(value as ReportPeriod)}
          >
            {label}
          </MenuItem>
        ))}
      </Stack>
    </CustomPopover>
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ width: 1 }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: 1 }}>
          {/* Sélecteur de période */}
          <Button
            disableRipple
            color="inherit"
            onClick={popover.onOpen}
            endIcon={
              <Iconify 
                icon={popover.open ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} 
              />
            }
            sx={{ 
              fontWeight: 'fontWeightSemiBold',
              minWidth: 180,
              justifyContent: 'space-between'
            }}
          >
            {REPORT_PERIODS[filters.period]}
          </Button>

          {/* Date de début */}
          <DatePicker
            label="Date de début"
            value={filters.startDate}
            onChange={handleFilterStartDate}
            disabled={filters.period !== 'custom'}
            slotProps={{
              textField: {
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:calendar-fill" />
                    </InputAdornment>
                  ),
                },
                sx: { minWidth: 180 }
              },
            }}
          />

          {/* Date de fin */}
          <DatePicker
            label="Date de fin"
            value={filters.endDate}
            onChange={handleFilterEndDate}
            disabled={filters.period !== 'custom'}
            slotProps={{
              textField: {
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:calendar-fill" />
                    </InputAdornment>
                  ),
                },
                sx: { minWidth: 180 }
              },
            }}
          />

          {/* Sélecteur de magasin */}
          {showStoreFilter && (
            <TextField
              select
              label="Magasin"
              value={filters.storeId || ''}
              onChange={handleFilterStore}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:home-fill" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">
                <em>Tous les magasins</em>
              </MenuItem>
              {stores.map((store) => (
                <MenuItem key={store.id} value={store.id}>
                  {store.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>

        {/* Bouton de rafraîchissement */}
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:refresh-fill" />}
          onClick={handleRefresh}
          sx={{ flexShrink: 0 }}
        >
          Actualiser
        </Button>
      </Stack>

      {renderFilterPeriod}
    </>
  );
}
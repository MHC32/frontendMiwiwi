// src/components/hook-form/RHFStoreAutocomplete.tsx
import { useFormContext, Controller } from 'react-hook-form';
import { Autocomplete, AutocompleteProps, Chip, TextField, Box } from '@mui/material';
import Iconify from 'src/components/iconify';
import { IStoreItem } from 'src/types/store';

// ----------------------------------------------------------------------

interface RHFStoreAutocompleteProps
  extends Omit<
    AutocompleteProps<IStoreItem, true, false, false>,
    'renderInput' | 'options' | 'value' | 'onChange'
  > {
  name: string;
  label: string;
  options: IStoreItem[];
}

export default function RHFStoreAutocomplete({
  name,
  label,
  options,
  ...other
}: RHFStoreAutocompleteProps) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // Convertir les IDs sélectionnés en objets IStoreItem complets
        const selectedStores = options.filter(store => 
          Array.isArray(field.value) ? field.value.includes(store.id) : false
        );

        return (
          <Autocomplete
            multiple
            options={options}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={selectedStores}
            onChange={(event, newValue) => {
              // Stocker seulement les IDs dans le formulaire
              const storeIds = newValue.map(store => store.id);
              setValue(name, storeIds, { shouldValidate: true });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                error={!!error}
                helperText={error?.message}
                placeholder="Sélectionner des magasins..."
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Iconify icon="eva:pin-fill" sx={{ mr: 1 }} />
                {option.name} - {option.contact.address.city}
              </Box>
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  label={option.name}
                  size="small"
                  color="info"
                  variant="soft"
                />
              ))
            }
            {...other}
          />
        );
      }}
    />
  );
}
// src/components/hook-form/RHFCompanyAutocomplete.tsx
import { useFormContext, Controller } from 'react-hook-form';
import { Autocomplete, AutocompleteProps, Chip, TextField, Box } from '@mui/material';
import Iconify from 'src/components/iconify';
import { ICompanyItem } from 'src/types/company';

// ----------------------------------------------------------------------

interface RHFCompanyAutocompleteProps
  extends Omit<
    AutocompleteProps<ICompanyItem, boolean, false, false>,
    'renderInput' | 'options' | 'value' | 'onChange'
  > {
  name: string;
  label: string;
  options: ICompanyItem[];
  multiple?: boolean;
}

export default function RHFCompanyAutocomplete({
  name,
  label,
  options,
  multiple = false,
  ...other
}: RHFCompanyAutocompleteProps) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // Gérer la valeur sélectionnée
        let selectedCompanies: ICompanyItem | ICompanyItem[] | null = null;
        
        if (multiple) {
          // Pour multiple: convertir les IDs sélectionnés en objets ICompanyItem complets
          selectedCompanies = Array.isArray(field.value) 
            ? options.filter(company => field.value.includes(company.id))
            : [];
        } else {
          // Pour single: trouver la compagnie correspondant à l'ID
          selectedCompanies = field.value 
            ? options.find(company => company.id === field.value) || null
            : null;
        }

        return (
          <Autocomplete
            multiple={multiple}
            options={options}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={selectedCompanies}
            onChange={(event, newValue) => {
              if (multiple) {
                // Stocker seulement les IDs dans le formulaire
                const companyIds = (newValue as ICompanyItem[]).map(company => company.id);
                setValue(name, companyIds, { shouldValidate: true });
              } else {
                // Stocker l'ID de la compagnie sélectionnée
                const selectedCompany = newValue as ICompanyItem | null;
                setValue(name, selectedCompany?.id || null, { shouldValidate: true });
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                error={!!error}
                helperText={error?.message}
                placeholder="Sélectionner une compagnie..."
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Iconify icon="eva:business-outline" sx={{ mr: 1 }} />
                {option.name} ({option.refCode})
              </Box>
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  label={`${option.name} (${option.refCode})`}
                  size="small"
                  color="primary"
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
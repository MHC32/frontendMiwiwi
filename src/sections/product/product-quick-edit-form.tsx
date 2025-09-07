// src/sections/product/product-quick-edit-form.tsx
import * as Yup from 'yup';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
// types
import { IProductItem } from 'src/types/product';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { 
  RHFTextField, 
  RHFSelect, 
  RHFSwitch 
} from 'src/components/hook-form';
// requests
import { productRequests } from 'src/utils/request';

// ----------------------------------------------------------------------

interface QuickEditFormValues {
  name: string;
  barcode: string;
  type: 'weight' | 'fuel' | 'unit';
  unit: string;
  inventory: {
    current: number;
    min_stock: number;
    alert_enabled: boolean;
  };
  pricing: {
    base_price: number;
    buy_price: number;
  };
  is_active: boolean;
}

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentProduct?: IProductItem;
  onSuccess?: VoidFunction;
};

export default function ProductQuickEditForm({ 
  currentProduct, 
  open, 
  onClose, 
  onSuccess 
}: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const TYPE_OPTIONS = [
    { value: 'weight', label: 'Poids' },
    { value: 'fuel', label: 'Carburant' },
    { value: 'unit', label: 'Unité' },
  ];

  const ProductSchema = Yup.object().shape({
    name: Yup.string()
      .required('Le nom du produit est requis')
      .min(2, 'Le nom doit contenir au moins 2 caractères'),
    barcode: Yup.string().optional(),
    type: Yup.string()
      .required('Le type est requis')
      .oneOf(['weight', 'fuel', 'unit'], 'Type invalide'),
    unit: Yup.string().required('L\'unité est requise'),
    inventory: Yup.object().shape({
      current: Yup.number()
        .required('Le stock actuel est requis')
        .min(0, 'Le stock ne peut pas être négatif'),
      min_stock: Yup.number()
        .required('Le stock minimum est requis')
        .min(0, 'Le stock minimum ne peut pas être négatif'),
      alert_enabled: Yup.boolean(),
    }),
    pricing: Yup.object().shape({
      base_price: Yup.number()
        .required('Le prix de vente est requis')
        .min(0, 'Le prix ne peut pas être négatif'),
      buy_price: Yup.number()
        .min(0, 'Le prix d\'achat ne peut pas être négatif')
        .optional(),
    }),
    is_active: Yup.boolean(),
  });

  const defaultValues = useMemo<QuickEditFormValues>(
    () => ({
      name: currentProduct?.name || '',
      barcode: currentProduct?.barcode || '',
      type: currentProduct?.type || 'unit',
      unit: currentProduct?.unit || '',
      inventory: {
        current: currentProduct?.inventory.current || 0,
        min_stock: currentProduct?.inventory.min_stock || 0,
        alert_enabled: currentProduct?.inventory.alert_enabled || false,
      },
      pricing: {
        base_price: currentProduct?.pricing.base_price || 0,
        buy_price: currentProduct?.pricing.buy_price || 0,
      },
      is_active: currentProduct?.is_active ?? true,
    }),
    [currentProduct]
  );

  const methods = useForm<QuickEditFormValues>({
    resolver: yupResolver(ProductSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const watchUnit = watch('unit');

  const onSubmit = useCallback(
    async (data: QuickEditFormValues) => {
      try {
        if (!currentProduct?._id) {
          throw new Error('ID du produit non défini');
        }

        // Créer FormData pour la mise à jour
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.barcode) formData.append('barcode', data.barcode);
        formData.append('type', data.type);
        formData.append('unit', data.unit);
        formData.append('inventory[current]', data.inventory.current.toString());
        formData.append('inventory[min_stock]', data.inventory.min_stock.toString());
        formData.append('inventory[alert_enabled]', data.inventory.alert_enabled.toString());
        formData.append('pricing[base_price]', data.pricing.base_price.toString());
        if (data.pricing.buy_price) {
          formData.append('pricing[buy_price]', data.pricing.buy_price.toString());
        }
        formData.append('is_active', data.is_active.toString());

        await productRequests.updateProduct(currentProduct._id, formData);
        
        reset();
        onClose();
        onSuccess?.();
        enqueueSnackbar('Produit mis à jour avec succès !', { variant: 'success' });
      } catch (error) {
        console.error(error);
        enqueueSnackbar(
          error instanceof Error 
            ? error.message 
            : 'Une erreur est survenue lors de la mise à jour',
          { variant: 'error' }
        );
      }
    },
    [currentProduct, reset, onClose, onSuccess, enqueueSnackbar]
  );

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ pb: 2 }}>
          Modification rapide - {currentProduct?.name}
        </DialogTitle>

        <DialogContent sx={{ typography: 'body2' }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Informations de base */}
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField 
                name="name" 
                label="Nom du produit"
              />

              <RHFTextField
                name="barcode"
                label="Code-barres"
                placeholder="Ex: 1234567890123"
              />

              <RHFSelect name="type" label="Type">
                {TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFTextField
                name="unit"
                label="Unité"
                placeholder="Ex: kg, L, pièce"
              />
            </Box>

            {/* Inventaire */}
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField
                name="inventory.current"
                label="Stock actuel"
                type="number"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {watchUnit}
                    </InputAdornment>
                  ),
                }}
              />

              <RHFTextField
                name="inventory.min_stock"
                label="Stock minimum"
                type="number"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {watchUnit}
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ gridColumn: 'span 2' }}>
                <RHFSwitch
                  name="inventory.alert_enabled"
                  label="Activer les alertes de stock faible"
                />
              </Box>
            </Box>

            {/* Tarification */}
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField
                name="pricing.base_price"
                label="Prix de vente"
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      HTG
                    </InputAdornment>
                  ),
                }}
              />

              <RHFTextField
                name="pricing.buy_price"
                label="Prix d'achat"
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      HTG
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Statut */}
            <RHFSwitch
              name="is_active"
              label="Produit actif"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} variant="outlined">
            Annuler
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Enregistrer
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
// src/sections/product/product-new-edit-form.tsx
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// types
import { IProductItem, ProductFormValues } from 'src/types/product';
import { IStoreItem } from 'src/types/store';
import { ICategory } from 'src/types/category';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFSelect,
  RHFUpload,
  RHFMultiUpload,
} from 'src/components/hook-form';
// requests
import { productRequests, storeRequests, categoryRequests } from 'src/utils/request';
// redux
import { useDispatch } from 'src/redux/store';
import { createProduct, updateProduct } from 'src/redux/slices/product';

// ----------------------------------------------------------------------

interface FormValuesProps extends ProductFormValues {
  is_active: boolean;
}

type Props = {
  currentProduct?: IProductItem | null;
  productId?: string;
};

export default function ProductNewEditForm({ currentProduct, productId }: Props) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [stores, setStores] = useState<IStoreItem[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Options pour les types de produits
  const TYPE_OPTIONS = [
  { value: 'quantity', label: 'Quantité' }, 
  { value: 'weight', label: 'Poids' },
  { value: 'volume', label: 'Volume' }, 
  { value: 'fuel', label: 'Carburant' },
];

  // Options pour le mode de tarification
const PRICING_MODE_OPTIONS = [
  { value: 'fixed', label: 'Prix fixe' },
  { value: 'perUnit', label: 'Prix par unité' }, 
  { value: 'dynamic', label: 'Prix variable' }, 
  { value: 'fuel', label: 'Prix carburant' },
];

  // Validation schema
  const NewProductSchema = Yup.object().shape({
  name: Yup.string()
    .required('Le nom du produit est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  barcode: Yup.string().optional(),
  type: Yup.string()
    .required('Le type de produit est requis')
    .oneOf(['weight', 'fuel', 'quantity', 'volume'], 'Type de produit invalide'), // ✅ Corrigé
  unit: Yup.string()
    .required('L\'unité est requise')
    .min(1, 'L\'unité doit contenir au moins 1 caractère'),
  store_id: Yup.string().required('Le magasin est requis'),
  category_id: Yup.string().optional(),
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
    mode: Yup.string()
      .required('Le mode de tarification est requis')
      .oneOf(['fixed', 'fuel', 'dynamic', 'perUnit'], 'Mode de tarification invalide'), // ✅ Corrigé
    base_price: Yup.number()
      .required('Le prix de base est requis')
      .min(0, 'Le prix ne peut pas être négatif'),
    buy_price: Yup.number()
      .min(0, 'Le prix d\'achat ne peut pas être négatif')
      .optional(),
    fuel_config: Yup.object().when('mode', {
      is: 'fuel',
      then: () => Yup.object().shape({
        price_per_unit: Yup.number()
          .required('Le prix par unité est requis')
          .min(0, 'Le prix par unité ne peut pas être négatif'),
        display_unit: Yup.string()
          .required('L\'unité d\'affichage est requise'),
      }),
      otherwise: () => Yup.object().optional(),
    }),
  }),
  is_active: Yup.boolean(),
});

 const defaultValues = useMemo<FormValuesProps>(
  () => ({
    name: currentProduct?.name || '',
    barcode: currentProduct?.barcode || '',
    type: currentProduct?.type || 'quantity', 
    unit: currentProduct?.unit || '',
    store_id: currentProduct?.store_id._id || '',
    category_id: currentProduct?.category_id?._id || '',
    inventory: {
      current: currentProduct?.inventory.current || 0,
      min_stock: currentProduct?.inventory.min_stock || 0,
      alert_enabled: currentProduct?.inventory.alert_enabled || false,
    },
    pricing: {
      mode: currentProduct?.pricing.mode || 'fixed',
      base_price: currentProduct?.pricing.base_price || 0,
      buy_price: currentProduct?.pricing.buy_price || 0,
      fuel_config: {
        price_per_unit: currentProduct?.pricing.fuel_config?.price_per_unit || 0,
        display_unit: currentProduct?.pricing.fuel_config?.display_unit || '',
      },
    },
    is_active: currentProduct?.is_active ?? true,
  }),
  [currentProduct]
);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const watchType = watch('type');
  const watchPricingMode = watch('pricing.mode');

  // Charger les données nécessaires
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingData(true);
        const [storesResponse, categoriesResponse] = await Promise.all([
          storeRequests.getStores({ limit: 100 }),
          categoryRequests.getCategories({ limit: 100 }),
        ]);
        
        setStores(storesResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        enqueueSnackbar('Erreur lors du chargement des données', { variant: 'error' });
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, [enqueueSnackbar]);

  // Reset form when currentProduct changes
  useEffect(() => {
    if (currentProduct) {
      reset({
        name: currentProduct.name,
        barcode: currentProduct.barcode || '',
        type: currentProduct.type,
        unit: currentProduct.unit,
        store_id: currentProduct.store_id._id,
        category_id: currentProduct.category_id?._id || '',
        inventory: {
          current: currentProduct.inventory.current,
          min_stock: currentProduct.inventory.min_stock,
          alert_enabled: currentProduct.inventory.alert_enabled,
        },
        pricing: {
          mode: currentProduct.pricing.mode,
          base_price: currentProduct.pricing.base_price,
          buy_price: currentProduct.pricing.buy_price || 0,
          fuel_config: {
            price_per_unit: currentProduct.pricing.fuel_config?.price_per_unit || 0,
            display_unit: currentProduct.pricing.fuel_config?.display_unit || '',
          },
        },
        is_active: currentProduct.is_active,
      });
    }
  }, [currentProduct, reset]);

  const onSubmit = useCallback(
    async (data: FormValuesProps) => {
      try {
        // Préparer les données pour l'API
        const formData = new FormData();
        
        // Données de base
        formData.append('name', data.name);
        if (data.barcode) formData.append('barcode', data.barcode);
        formData.append('type', data.type);
        formData.append('unit', data.unit);
        formData.append('storeId', data.store_id);  // ✅ Correction: storeId au lieu de store_id
        if (data.category_id) formData.append('categoryId', data.category_id);  // ✅ Correction: categoryId au lieu de category_id
        
        // Inventaire
        formData.append('inventory[current]', data.inventory.current.toString());
        formData.append('inventory[min_stock]', data.inventory.min_stock.toString());
        formData.append('inventory[alert_enabled]', data.inventory.alert_enabled.toString());
        
        // Tarification
        formData.append('pricing[mode]', data.pricing.mode);
        formData.append('pricing[base_price]', data.pricing.base_price.toString());
        if (data.pricing.buy_price) {
          formData.append('pricing[buy_price]', data.pricing.buy_price.toString());
        }
        
        // Configuration carburant si applicable
        if (data.pricing.mode === 'fuel' && data.pricing.fuel_config) {
          formData.append('pricing[fuel_config][price_per_unit]', data.pricing.fuel_config.price_per_unit.toString());
          formData.append('pricing[fuel_config][display_unit]', data.pricing.fuel_config.display_unit);
        }

        // Images si présentes
        if (data.images && data.images.length > 0) {
          data.images.forEach((image, index) => {
            formData.append(`images`, image);
          });
        }

        // Statut actif
        formData.append('is_active', data.is_active.toString());

        if (productId && currentProduct) {
          // Mise à jour
          await dispatch(updateProduct({ id: productId, data: formData }));
          enqueueSnackbar('Produit mis à jour avec succès !', { variant: 'success' });
        } else {
          // Création
          await dispatch(createProduct(formData));
          enqueueSnackbar('Produit créé avec succès !', { variant: 'success' });
        }

        router.push(paths.dashboard.product.root);
      } catch (error) {
        console.error(error);
        enqueueSnackbar(
          error instanceof Error 
            ? error.message 
            : 'Une erreur est survenue lors de l\'enregistrement',
          { variant: 'error' }
        );
      }
    },
    [productId, currentProduct, dispatch, enqueueSnackbar, router]
  );

  const handleDelete = useCallback(async () => {
    if (!productId || !currentProduct) return;
    
    try {
      await productRequests.deactivateProduct(productId);
      enqueueSnackbar('Produit supprimé avec succès !', { variant: 'success' });
      router.push(paths.dashboard.product.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
    }
  }, [productId, currentProduct, enqueueSnackbar, router]);

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Upload d'images */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Images du produit
                </Typography>
                <RHFMultiUpload
                  name="images"
                  maxFiles={5}
                  accept={{
                    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
                  }}
                  helperText="Ajoutez jusqu'à 5 images (JPEG, PNG, GIF)"
                />
              </Box>

              <Divider />

              {/* Statut */}
              {currentProduct && (
                <FormControlLabel
                  labelPlacement="start"
                  control={
                    <Controller
                      name="is_active"
                      control={methods.control}
                      render={({ field }) => (
                        <Switch
                          {...field}
                          checked={field.value}
                          onChange={(event) => field.onChange(event.target.checked)}
                        />
                      )}
                    />
                  }
                  label={
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Statut
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {watch('is_active') ? 'Actif' : 'Inactif'}
                      </Typography>
                    </>
                  }
                  sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
                />
              )}

              {/* Bouton de suppression */}
              {currentProduct && (
                <Button
                  variant="soft"
                  color="error"
                  onClick={handleDelete}
                  startIcon={<Iconify icon="eva:trash-2-outline" />}
                >
                  Supprimer le produit
                </Button>
              )}
            </Stack>
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Stack spacing={3}>
            {/* Informations de base */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Informations de base
              </Typography>
              
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
                  placeholder="Ex: Riz blanc 25kg"
                />

                <RHFTextField
                  name="barcode"
                  label="Code-barres"
                  placeholder="Ex: 1234567890123"
                />

                <RHFSelect name="type" label="Type de produit">
                  {TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>

                <RHFTextField
                  name="unit"
                  label="Unité"
                  placeholder={
                    watchType === 'weight' ? 'Ex: kg, g, lb' :
                    watchType === 'fuel' ? 'Ex: L, gal' :
                    'Ex: pièce, boîte'
                  }
                />

                <RHFSelect name="store_id" label="Magasin">
                  {stores.map((store) => (
                    <MenuItem key={store.id} value={store.id}>
                      {store.name}
                    </MenuItem>
                  ))}
                </RHFSelect>

                <RHFSelect name="category_id" label="Catégorie (optionnel)">
                  <MenuItem value="">Aucune catégorie</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Box>
            </Card>

            {/* Inventaire */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Gestion d'inventaire
              </Typography>
              
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
                        {watch('unit')}
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
                        {watch('unit')}
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
            </Card>

            {/* Tarification */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Tarification
              </Typography>
              
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFSelect name="pricing.mode" label="Mode de tarification">
                  {PRICING_MODE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>

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
                  label="Prix d'achat (optionnel)"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        HTG
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Configuration spécifique au carburant */}
                {watchPricingMode === 'fuel' && (
                  <>
                    <RHFTextField
                      name="pricing.fuel_config.price_per_unit"
                      label="Prix par unité carburant"
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
                      name="pricing.fuel_config.display_unit"
                      label="Unité d'affichage"
                      placeholder="Ex: gourde/gallon"
                    />
                  </>
                )}
              </Box>
            </Card>

            {/* Boutons d'action */}
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => router.push(paths.dashboard.product.root)}
              >
                Annuler
              </Button>
              
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                size="large"
              >
                {!currentProduct ? 'Créer le produit' : 'Enregistrer les modifications'}
              </LoadingButton>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
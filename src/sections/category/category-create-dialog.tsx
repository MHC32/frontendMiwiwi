// src/sections/category/category-create-dialog.tsx
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'src/redux/store';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Unstable_Grid2';
// types
import { 
  ICategory, 
  ICategoryFormValues,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  CategoryIcon,
  CategoryColor
} from 'src/types/category';
import { IStoreItem } from 'src/types/store';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFSelect,
  RHFAutocomplete,
  RHFStoreAutocomplete
} from 'src/components/hook-form';
// redux
import { createCategory } from '../../redux/slices/category';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onSuccess: VoidFunction;
  stores: IStoreItem[];
  categories: ICategory[];
};

interface FormValuesProps extends ICategoryFormValues {}

export default function CategoryCreateDialog({
  open,
  onClose,
  onSuccess,
  stores,
  categories,
}: Props) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [selectedColor, setSelectedColor] = useState<CategoryColor>('#4CAF50');
  const [selectedIcon, setSelectedIcon] = useState<CategoryIcon>('other');

  const NewCategorySchema = Yup.object().shape({
    name: Yup.string()
      .required('Le nom est requis')
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
    parent_id: Yup.string().nullable(),
    color: Yup.string().required('Une couleur est requise'),
    icon: Yup.string().required('Une icône est requise'),
    storeIds: Yup.array().of(Yup.string()),
  });

  const defaultValues = useMemo(
    () => ({
      name: '',
      parent_id: null,
      color: selectedColor,
      icon: selectedIcon,
      storeIds: [],
    }),
    [selectedColor, selectedIcon]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewCategorySchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  // Filtrer les catégories pour le parent (exclure les sous-catégories pour éviter la complexité)
  const availableParents = categories.filter(cat => 
    cat.is_active && !cat.parent_id // Seulement les catégories racines
  );

    const storeOptions = stores;  
  const parentOptions = [
    { label: 'Aucun (Catégorie racine)', value: null },
    ...availableParents.map(cat => ({
      label: cat.name,
      value: cat._id,
    })),
  ];

  const onSubmit = useCallback(
    async (data: FormValuesProps) => {
      try {
        const payload = {
          ...data,
          color: selectedColor,
          icon: selectedIcon,
        };

        await dispatch(createCategory(payload));
        reset();
        setSelectedColor('#4CAF50');
        setSelectedIcon('other');
        onSuccess();
        enqueueSnackbar('Catégorie créée avec succès!');
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Erreur lors de la création de la catégorie', { variant: 'error' });
      }
    },
    [dispatch, enqueueSnackbar, onSuccess, reset, selectedColor, selectedIcon]
  );

  const handleClose = useCallback(() => {
    reset();
    setSelectedColor('#4CAF50');
    setSelectedIcon('other');
    onClose();
  }, [onClose, reset]);

  const handleColorSelect = useCallback((color: CategoryColor) => {
    setSelectedColor(color);
    setValue('color', color);
  }, [setValue]);

  const handleIconSelect = useCallback((icon: CategoryIcon) => {
    setSelectedIcon(icon);
    setValue('icon', icon);
  }, [setValue]);

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, string> = {
      food: 'mdi:food',
      clothing: 'mdi:tshirt-crew',
      electronics: 'mdi:cellphone',
      books: 'mdi:book-open-page-variant',
      sports: 'mdi:soccer',
      home: 'mdi:home',
      beauty: 'mdi:face-woman',
      health: 'mdi:heart-pulse',
      automotive: 'mdi:car',
      other: 'mdi:dots-horizontal',
    };
    return iconMap[iconName] || iconMap.other;
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          <Typography variant="h6">Créer une nouvelle catégorie</Typography>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <RHFTextField
              name="name"
              label="Nom de la catégorie"
              placeholder="Ex: Électronique, Vêtements, etc."
            />

            <RHFSelect 
              name="parent_id" 
              label="Catégorie parente"
              helperText="Laissez vide pour créer une catégorie racine"
            >
              {parentOptions.map((option) => (
                <MenuItem key={option.value || 'null'} value={option.value || ''}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFStoreAutocomplete
              name="storeIds"
              label="Magasins"
              options={storeOptions}
            />

            <Stack spacing={2}>
              <Typography variant="subtitle2">Couleur</Typography>
              <Grid container spacing={1}>
                {CATEGORY_COLORS.map((color) => (
                  <Grid key={color} xs={2}>
                    <Box
                      onClick={() => handleColorSelect(color)}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: color,
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: selectedColor === color ? 3 : 1,
                        borderColor: selectedColor === color ? 'primary.main' : 'divider',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="subtitle2">Icône</Typography>
              <Grid container spacing={1}>
                {CATEGORY_ICONS.map((icon) => (
                  <Grid key={icon} xs={2}>
                    <Box
                      onClick={() => handleIconSelect(icon)}
                      sx={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: selectedIcon === icon ? 2 : 1,
                        borderColor: selectedIcon === icon ? 'primary.main' : 'divider',
                        bgcolor: selectedIcon === icon ? 'primary.lighter' : 'background.neutral',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'primary.lighter',
                        },
                      }}
                    >
                      <Iconify 
                        icon={getIconComponent(icon)} 
                        width={20}
                        color={selectedIcon === icon ? 'primary.main' : 'text.secondary'}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Stack>

            {/* Aperçu */}
            <Card sx={{ p: 2, bgcolor: 'background.neutral' }}>
              <Typography variant="subtitle2" gutterBottom>
                Aperçu
              </Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: selectedColor,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <Iconify 
                    icon={getIconComponent(selectedIcon)} 
                    width={16}
                  />
                </Box>
                <Typography variant="body2">
                  {values.name || 'Nom de la catégorie'}
                </Typography>
              </Stack>
            </Card>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Annuler
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Créer la catégorie
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
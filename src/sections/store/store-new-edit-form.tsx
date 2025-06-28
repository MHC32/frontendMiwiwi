import * as Yup from 'yup';
import { useCallback, useMemo } from 'react';
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
// utils
import { fData } from 'src/utils/format-number';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// types
import { IStoreItem, StoreFormValues } from 'src/types/store';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { CustomFile } from 'src/components/upload';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
// requests
import { storeRequests } from 'src/utils/request';

// ----------------------------------------------------------------------

interface FormValuesProps extends Omit<StoreFormValues, 'photo'> {
  photoUrl: CustomFile | string | null;
  is_active: boolean;
}

type Props = {
  currentStore?: IStoreItem;
  storeId?: string;
};

export default function StoreNewEditForm({ currentStore, storeId }: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const StoreSchema = Yup.object().shape({
    name: Yup.string().required('Le nom du magasin est requis'),
    contact: Yup.object().shape({
      phone: Yup.string()
        .required('Le téléphone est requis')
        .matches(/^[0-9]{8,15}$/, 'Numéro de téléphone invalide'),
      address: Yup.object().shape({
        city: Yup.string().required('La ville est requise'),
        country: Yup.string().required('Le pays est requis'),
      }),
    }),
    is_active: Yup.boolean(),
    photoUrl: Yup.mixed()
      .nullable()
      .test('fileSize', 'La taille maximale est de 3MB', (value) => {
        if (value instanceof File) {
          return value.size <= 3145728; // 3MB
        }
        return true;
      })
      .test('fileType', 'Seuls JPEG, PNG sont autorisés', (value) => {
        if (value instanceof File) {
          return ['image/jpeg', 'image/png'].includes(value.type);
        }
        return true;
      }),
  });

  const defaultValues = useMemo<FormValuesProps>(
    () => ({
      name: currentStore?.name || '',
      contact: {
        phone: currentStore?.contact?.phone || '',
        address: {
          city: currentStore?.contact?.address?.city || '',
          country: currentStore?.contact?.address?.country || 'Haïti',
        },
      },
      is_active: currentStore?.is_active ?? true,
      photoUrl: currentStore?.photo || null,
      supervisor_id: currentStore?.supervisor_id || undefined,
    }),
    [currentStore]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(StoreSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const prepareFormData = (data: FormValuesProps): StoreFormValues => {
    return {
      name: data.name,
      contact: data.contact,
      is_active: data.is_active,
      supervisor_id: data.supervisor_id,
      photo: data.photoUrl instanceof File ? data.photoUrl : data.photoUrl || undefined,
    };
  };

  const onSubmit = useCallback(
    async (data: FormValuesProps) => {
      try {
        const formData = prepareFormData(data);

        if (storeId) {
          await storeRequests.updateStore(storeId, formData);
          enqueueSnackbar('Magasin mis à jour avec succès !');
        } else {
          await storeRequests.createStore(formData);
          enqueueSnackbar('Magasin créé avec succès !');
        }
        router.push(paths.dashboard.store.list);
      } catch (error) {
        console.error(error);
        enqueueSnackbar(
          error.message || 'Une erreur est survenue',
          { variant: 'error' }
        );
      }
    },
    [storeId, enqueueSnackbar, router]
  );

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('photoUrl', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleRemovePhoto = useCallback(() => {
    setValue('photoUrl', null, { shouldValidate: true });
  }, [setValue]);

  const handleDelete = useCallback(async () => {
    try {
      if (!storeId) return;
      await storeRequests.deleteStore(storeId);
      enqueueSnackbar('Magasin supprimé avec succès');
      router.push(paths.dashboard.store.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
    }
  }, [storeId, enqueueSnackbar, router]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            {currentStore && (
              <Label
                color={values.is_active ? 'success' : 'error'}
                sx={{ position: 'absolute', top: 24, right: 24 }}
              >
                {values.is_active ? 'Actif' : 'Inactif'}
              </Label>
            )}

            <Box sx={{ mb: 5 }}>
              <RHFUploadAvatar
                name="photoUrl"
                maxSize={3145728}
                onDrop={handleDrop}
                onDelete={handleRemovePhoto}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    Formats acceptés: *.jpeg, *.jpg, *.png
                    <br /> Taille max: {fData(3145728)}
                  </Typography>
                }
              />
            </Box>

            {currentStore && (
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        color="success"
                      />
                    )}
                  />
                }
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Statut du magasin
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {values.is_active ? 'Actif' : 'Inactif'}
                    </Typography>
                  </>
                }
                sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
              />
            )}

            {currentStore && (
              <Stack spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                <Button
                  variant="soft"
                  color="error"
                  onClick={handleDelete}
                  startIcon={<Iconify icon="eva:trash-2-outline" />}
                >
                  Supprimer le magasin
                </Button>
              </Stack>
            )}
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="name" label="Nom du magasin" />

              <RHFTextField
                name="contact.phone"
                label="Téléphone"
                placeholder="Ex: 37491234"
              />

              <RHFTextField
                name="contact.address.city"
                label="Ville"
              />

              <RHFTextField
                name="contact.address.country"
                label="Pays"
                disabled
              />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                size="large"
              >
                {!currentStore ? 'Créer le magasin' : 'Enregistrer les modifications'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
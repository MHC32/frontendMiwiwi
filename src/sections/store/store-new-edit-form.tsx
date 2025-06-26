import * as Yup from 'yup';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// types
import { IStoreItem, StoreFormValues } from 'src/types/store';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFSwitch,
} from 'src/components/hook-form';
// requests
import { storeRequests } from 'src/utils/request';

// ----------------------------------------------------------------------

type Props = {
  currentStore?: IStoreItem;
  storeId?: string;
};

export default function StoreNewEditForm({ currentStore, storeId  }: Props) {
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
  });

  const defaultValues = useMemo<StoreFormValues>(
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
  }),
  [currentStore]
);

  const methods = useForm<StoreFormValues>({
    resolver: yupResolver(StoreSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  
  const onSubmit = useCallback(
    async (data: StoreFormValues) => {
      try {
        if (storeId) { // Utilisez storeId au lieu de currentStore.id
          await storeRequests.updateStore(storeId, data);
          enqueueSnackbar('Magasin mis à jour avec succès !');
        } else {
          await storeRequests.createStore(data);
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
    [storeId, enqueueSnackbar, router] // Ajoutez storeId aux dépendances
  );

 const handleDelete = useCallback(async () => {
    try {
      if (!storeId) return; // Utilisez storeId ici aussi
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
                color={currentStore.is_active ? 'success' : 'error'}
                sx={{ position: 'absolute', top: 24, right: 24 }}
              >
                {currentStore.is_active ? 'Actif' : 'Inactif'}
              </Label>
            )}

            <Box sx={{ mb: 5 }}>
              <Box
                sx={{
                  width: 144,
                  height: 144,
                  mx: 'auto',
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:shop-bold" width={64} color="white" />
              </Box>
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
                Logo du magasin
              </Typography>
            </Box>

            {currentStore && (
              <FormControlLabel
                labelPlacement="start"
                control={
                  <RHFSwitch
                    name="is_active"
                    label={null}
                  />
                }
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Activer/Désactiver
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Contrôler l'état du magasin
                    </Typography>
                  </>
                }
                sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
              />
            )}

            {currentStore && (
              <Stack justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                <Button variant="soft" color="error" onClick={handleDelete}>
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
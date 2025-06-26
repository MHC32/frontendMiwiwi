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
// types
import { IStoreItem, StoreFormValues } from 'src/types/store';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFSelect, RHFSwitch } from 'src/components/hook-form';
// requests
import { storeRequests } from 'src/utils/request';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentStore?: IStoreItem;
};

export default function StoreQuickEditForm({ currentStore, open, onClose }: Props) {
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
        phone: currentStore?.contact.phone || '',
        address: {
          city: currentStore?.contact.address.city || '',
          country: currentStore?.contact.address.country || 'Haïti',
        },
      },
      is_active: currentStore?.is_active || false,
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
        if (!currentStore?.id) {
          throw new Error('ID du magasin non défini');
        }
        
        await storeRequests.updateStore(currentStore.id, {
          name: data.name,
          contact: {
            phone: data.contact.phone,
            address: {
              city: data.contact.address.city,
              country: data.contact.address.country,
            },
          },
        });
        
        reset();
        onClose();
        enqueueSnackbar('Magasin mis à jour avec succès !');
      } catch (error) {
        console.error(error);
        enqueueSnackbar(
          error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
          { variant: 'error' }
        );
      }
    },
    [currentStore?.id, enqueueSnackbar, onClose, reset]
  );

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Modification rapide</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
            sx={{ mt: 1 }}
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

            <RHFSelect
              name="contact.address.country"
              label="Pays"
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="Haïti">Haïti</MenuItem>
            </RHFSelect>

            <RHFSwitch
              name="is_active"
              label="Statut"
              labelPlacement="start"
              sx={{ justifyContent: 'space-between' }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
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
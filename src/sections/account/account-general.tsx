import * as Yup from 'yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
import { useAuth } from 'src/hooks/use-auth';


import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,

} from 'src/components/hook-form';

// ----------------------------------------------------------------------

type FormValuesProps = {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
 
};

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();
  const { user, profile } = useAuth();

  const UpdateUserSchema = Yup.object().shape({
    firstName: Yup.string().required('Le prénom est requis'),
    lastName: Yup.string().required('Le nom est requis'),
    email: Yup.string().email('Email doit être une adresse valide'),
    phone: Yup.string().required('Le téléphone est requis'),
  });

  const defaultValues = {
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    email: profile?.email || '',
    phone: profile?.phone || '',

  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = useCallback(
    async (data: FormValuesProps) => {
      try {
        // Ici vous devrez implémenter l'appel API pour mettre à jour le profil
        // Exemple : await authRequests.updateProfile(data);
        await new Promise((resolve) => setTimeout(resolve, 500));
        enqueueSnackbar('Profil mis à jour avec succès !');
        console.info('DATA', data);
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Erreur lors de la mise à jour du profil', { variant: 'error' });
      }
    },
    [enqueueSnackbar]
  );

 

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
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
              <RHFTextField name="firstName" label="Prénom" />
              <RHFTextField name="lastName" label="Nom" />
              <RHFTextField name="email" label="Adresse email" />
              <RHFTextField name="phone" label="Téléphone" />
            
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Enregistrer les modifications
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
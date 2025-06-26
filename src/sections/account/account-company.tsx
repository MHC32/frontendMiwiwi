import * as Yup from 'yup';
import { useCallback } from 'react';
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
// hooks
import { useAuth } from 'src/hooks/use-auth';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFSelect,
} from 'src/components/hook-form';

import InputAdornment from '@mui/material/InputAdornment';
// ----------------------------------------------------------------------

type FormValuesProps = {
  name: string;
  ref_code: string;
  currency: string;
  tax_rate: number;
};

export default function AccountCompany() {
  const { enqueueSnackbar } = useSnackbar();
  const { profile } = useAuth();

  // Récupère la première compagnie ou undefined si aucune
  const company = profile?.companies?.[0];

  const UpdateCompanySchema = Yup.object().shape({
    name: Yup.string().required('Le nom de la compagnie est requis'),
    ref_code: Yup.string().required('Le code référence est requis'),
    currency: Yup.string().required('La devise est requise'),
    tax_rate: Yup.number()
      .required('Le taux de taxe est requis')
      .min(0, 'Le taux ne peut pas être négatif')
      .max(100, 'Le taux ne peut pas dépasser 100%'),
  });

  const defaultValues = {
    name: company?.name || '',
    ref_code: company?.ref_code || '',
    currency: company?.settings?.currency || 'EUR',
    tax_rate: company?.settings?.tax_rate || 0,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateCompanySchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = useCallback(
    async (data: FormValuesProps) => {
      try {
        if (company) {
          // Mise à jour de la compagnie existante
          // await authRequests.updateCompany(company.id, data);
          enqueueSnackbar('Compagnie mise à jour avec succès !');
        } else {
          // Création d'une nouvelle compagnie
          // await authRequests.createCompany(data);
          enqueueSnackbar('Compagnie créée avec succès !');
        }
        console.info('DATA', data);
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Erreur lors de la mise à jour', { variant: 'error' });
      }
    },
    [company, enqueueSnackbar]
  );

  if (!company) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Vous n'avez pas encore de compagnie
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Créez votre première compagnie pour commencer à gérer vos magasins et employés.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={methods.handleSubmit(onSubmit)}
            >
              Créer une compagnie
            </Button>
          </Card>
        </Grid>
      </Grid>
    );
  }

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
              <RHFTextField name="name" label="Nom de la compagnie" />
              <RHFTextField name="ref_code" label="Code référence" />
              
              <RHFSelect
                name="currency"
                label="Devise"
                InputLabelProps={{ shrink: true }}
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollar ($)</option>
                <option value="XOF">Franc CFA (XOF)</option>
              </RHFSelect>

              <RHFTextField 
                name="tax_rate" 
                label="Taux de taxe (%)" 
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {company ? 'Mettre à jour' : 'Créer'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>

        <Grid xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informations sur la compagnie
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configurez ici les informations de base de votre compagnie qui seront utilisées pour 
              les factures, devis et autres documents commerciaux.
            </Typography>
            
            {company && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2">Statut:</Typography>
                <Typography color={company.is_active ? 'success.main' : 'error.main'}>
                  {company.is_active ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
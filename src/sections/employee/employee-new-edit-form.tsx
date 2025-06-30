import * as Yup from 'yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector, useDispatch } from 'src/redux/store';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// types
import { Cashier, Supervisor, EmployeeFormValues } from 'src/types/employee';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFSelect,
} from 'src/components/hook-form';
// requests
import { employeeRequests } from 'src/utils/request';
import MenuItem from '@mui/material/MenuItem';
// redux
import { selectStores, fetchStores } from 'src/redux/slices/store.slice';

// ----------------------------------------------------------------------

interface FormValuesProps extends EmployeeFormValues {}

type Props = {
  currentEmployee?: Cashier | Supervisor | null;
  employeeId?: string;
};

export default function EmployeeNewEditForm({ currentEmployee, employeeId }: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const stores = useSelector(selectStores);

  // Charger les magasins actifs au montage du composant
  useEffect(() => {
    dispatch(fetchStores({ is_active: true }));
  }, [dispatch]);

  const EmployeeSchema = Yup.object().shape({
    first_name: Yup.string().required('Le prénom est requis'),
    last_name: Yup.string().required('Le nom est requis'),
    phone: Yup.string()
      .required('Le téléphone est requis')
      .matches(/^[0-9]{8,15}$/, 'Numéro de téléphone invalide'),
    email: Yup.string().email('Email invalide').optional(),
    role: Yup.string().required('Le rôle est requis'),
    is_active: Yup.boolean()
      .transform((value) => value === 'true' || value === true)
      .default(true),
    store_id: Yup.string().when('role', {
      is: 'cashier',
      then: (schema) => schema.required('Le magasin est requis pour un caissier'),
    }),
    supervised_store_id: Yup.string().when('role', {
      is: 'supervisor',
      then: (schema) => schema.required('Le magasin supervisé est requis'),
    }),
  });

  const defaultValues = useMemo<FormValuesProps>(() => {
    return {
      first_name: currentEmployee?.first_name || '',
      last_name: currentEmployee?.last_name || '',
      phone: currentEmployee?.phone || '',
      email: currentEmployee?.email || '',
      role: currentEmployee?.role || 'cashier',
      is_active: currentEmployee?.is_active ?? true,
      store_id: currentEmployee?.role === 'cashier' 
        ? (currentEmployee as Cashier).store_id || '' 
        : '',
      supervised_store_id: currentEmployee?.role === 'supervisor' 
        ? (currentEmployee as Supervisor).supervised_store_id || '' 
        : '',
    };
  }, [currentEmployee]);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(EmployeeSchema),
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
  const role = watch('role');

  // Réinitialiser les champs de magasin quand le rôle change
  useEffect(() => {
    if (role === 'cashier') {
      setValue('supervised_store_id', '');
    } else if (role === 'supervisor') {
      setValue('store_id', '');
    }
  }, [role, setValue]);

  const prepareFormData = (data: FormValuesProps): EmployeeFormValues => {
    return {
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      email: data.email || undefined,
      role: data.role as 'cashier' | 'supervisor',
      is_active: Boolean(data.is_active),
      store_id: data.role === 'cashier' ? data.store_id : undefined,
      supervised_store_id: data.role === 'supervisor' ? data.supervised_store_id : undefined,
    };
  };

  const onSubmit = useCallback(
    async (data: FormValuesProps) => {
      try {
        const formData = prepareFormData(data);

        if (employeeId && currentEmployee) {
          await employeeRequests.updateEmployee(employeeId, formData);
          enqueueSnackbar('Employé mis à jour avec succès !');
        } else {
          await employeeRequests.createEmployee(formData);
          enqueueSnackbar('Employé créé avec succès !');
        }
        router.push(paths.dashboard.employee.list);
      } catch (error) {
        console.error(error);
        enqueueSnackbar(
          error instanceof Error ? error.message : 'Une erreur est survenue',
          { variant: 'error' }
        );
      }
    },
    [employeeId, enqueueSnackbar, router, currentEmployee]
  );

  const handleDelete = useCallback(async () => {
    try {
      if (!employeeId) return;
      await employeeRequests.deleteEmployee(employeeId);
      enqueueSnackbar('Employé supprimé avec succès');
      router.push(paths.dashboard.employee.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
    }
  }, [employeeId, enqueueSnackbar, router]);

  if (employeeId && !currentEmployee) {
    return <div>Chargement...</div>;
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
              <RHFTextField 
                name="first_name" 
                label="Prénom"
              />

              <RHFTextField
                name="last_name"
                label="Nom"
              />

              <RHFTextField
                name="phone"
                label="Téléphone"
                placeholder="Ex: 37491234"
              />

              <RHFTextField
                name="email"
                label="Email"
                type="email"
              />

              <RHFSelect
                name="role"
                label="Rôle"
              >
                <MenuItem value="cashier">Caissier</MenuItem>
                <MenuItem value="supervisor">Superviseur</MenuItem>
              </RHFSelect>

              {role === 'cashier' && (
                <RHFSelect
                  name="store_id"
                  label="Magasin assigné"
                >
                  <MenuItem value="">
                    <em>Sélectionnez un magasin</em>
                  </MenuItem>
                  {stores.map((store) => (
                    <MenuItem key={store.id} value={store.id}>
                      {store.name}
                    </MenuItem>
                  ))}
                </RHFSelect>
              )}

              {role === 'supervisor' && (
                <RHFSelect
                  name="supervised_store_id"
                  label="Magasin supervisé"
                >
                  <MenuItem value="">
                    <em>Sélectionnez un magasin</em>
                  </MenuItem>
                  {stores.map((store) => (
                    <MenuItem key={store.id} value={store.id}>
                      {store.name}
                    </MenuItem>
                  ))}
                </RHFSelect>
              )}

              <FormControlLabel
                control={
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        {...field}
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                }
                label="Actif"
                sx={{ mt: 1 }}
              />
            </Box>

            <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
              {employeeId && (
                <Button
                  color="error"
                  onClick={handleDelete}
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                >
                  Supprimer
                </Button>
              )}

              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                size="large"
              >
                {!currentEmployee ? 'Créer l\'employé' : 'Enregistrer les modifications'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>

        <Grid xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informations complémentaires
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {role === 'cashier' 
                ? 'Le caissier sera assigné au magasin sélectionné' 
                : 'Le superviseur supervisera le magasin sélectionné'}
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector, useDispatch } from 'src/redux/store';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// types
import { 
  Employee, 
  EmployeeFormValues, 
  isCashier, 
  isSupervisor,
  getEmployeeStores 
} from 'src/types/employee';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFSelect,
  RHFSwitch,
} from 'src/components/hook-form';
// redux
import { selectStores, fetchStores } from 'src/redux/slices/store.slice';
import { updateEmployee, createEmployee, deleteEmployee } from 'src/redux/slices/employee.slice';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

interface FormValuesProps extends EmployeeFormValues {}

type Props = {
  currentEmployee?: Employee | null;
  employeeId?: string;
};

export default function EmployeeNewEditForm({ currentEmployee, employeeId }: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const stores = useSelector(selectStores);

  // Charger les magasins actifs
  useEffect(() => {
    dispatch(fetchStores({ is_active: true }));
  }, [dispatch]);

  const EmployeeSchema = Yup.object().shape({
    first_name: Yup.string().required('Le prénom est requis'),
    last_name: Yup.string().required('Le nom est requis'),
    phone: Yup.string()
      .required('Le téléphone est requis'),
      // .matches(/^[0-9]{8,15}$/, 'Numéro de téléphone invalide'),
    email: Yup.string().optional().email('Email invalide'),
    role: Yup.string().required('Le rôle est requis'),
    password: Yup.string()
      .when('employeeId', {
        is: undefined,
        then: (schema) => schema.required('Le mot de passe est requis').min(6, 'Minimum 6 caractères'),
        otherwise: (schema) => schema.optional(),
      }),
    pin_code: Yup.string()
      .required('Le code PIN est requis')
      .matches(/^[0-9]{4}$/, 'Doit être 4 chiffres'),
    is_active: Yup.boolean().default(true),
    store_id: Yup.string().when('role', {
      is: 'cashier',
      then: (schema) => schema.required('Le magasin est requis'),
    }),
    supervised_store_id: Yup.string().when('role', {
      is: 'supervisor',
      then: (schema) => schema.required('Le magasin supervisé est requis'),
    }),
  });

  // Helper pour extraire les IDs de magasins
  const getStoreIdFromEmployee = useCallback((employee: Employee): string => {
    if (isCashier(employee)) {
      // Pour les caissiers, prendre le premier magasin assigné
      return employee.stores.length > 0 ? employee.stores[0]._id : '';
    } else if (isSupervisor(employee)) {
      // Pour les superviseurs, prendre le magasin supervisé
      return employee.supervisedStore?._id || '';
    }
    return '';
  }, []);

  const getSupervisedStoreIdFromEmployee = useCallback((employee: Employee): string => {
    if (isSupervisor(employee)) {
      return employee.supervisedStore?._id || '';
    }
    return '';
  }, []);

  const defaultValues = useMemo<FormValuesProps>(() => ({
    first_name: currentEmployee?.first_name || '',
    last_name: currentEmployee?.last_name || '',
    phone: currentEmployee?.phone || '',
    email: currentEmployee?.email || '',
    role: currentEmployee?.role || 'cashier',
    password: '',
    pin_code: currentEmployee?.pin_code?.toString() || '',
    is_active: currentEmployee?.is_active ?? true,
    store_id: currentEmployee && isCashier(currentEmployee) 
      ? getStoreIdFromEmployee(currentEmployee)
      : '',
    supervised_store_id: currentEmployee && isSupervisor(currentEmployee) 
      ? getSupervisedStoreIdFromEmployee(currentEmployee)
      : '',
  }), [currentEmployee, getStoreIdFromEmployee, getSupervisedStoreIdFromEmployee]);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(EmployeeSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();
  const role = watch('role');

  const onSubmit = useCallback(
    async (data: FormValuesProps) => {
      try {
        const formData: EmployeeFormValues = {
          ...data,
          // Ne pas envoyer le mot de passe s'il est vide (en cas d'édition)
          password: data.password || undefined,
        };

        if (employeeId) {
          await dispatch(updateEmployee(employeeId, formData));
          enqueueSnackbar('Employé mis à jour avec succès !');
        } else {
          await dispatch(createEmployee(formData));
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
    [employeeId, enqueueSnackbar, router, dispatch]
  );

  const handleDelete = useCallback(async () => {
    try {
      if (!employeeId) return;
      await dispatch(deleteEmployee(employeeId));
      enqueueSnackbar('Employé supprimé avec succès');
      router.push(paths.dashboard.employee.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
    }
  }, [employeeId, enqueueSnackbar, router, dispatch]);

  // Helper pour obtenir le nom du magasin sélectionné
  const getSelectedStoreName = useCallback((storeId: string): string => {
    const store = stores.find((s) => s.id === storeId);
    return store?.name || '';
  }, [stores]);

  // Helper pour obtenir les magasins de l'employé actuel
  const getCurrentEmployeeStores = useCallback((): string[] => {
    if (!currentEmployee) return [];
    return getEmployeeStores(currentEmployee).map(store => store.name);
  }, [currentEmployee]);

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
              <RHFTextField name="first_name" label="Prénom" />
              <RHFTextField name="last_name" label="Nom" />
              <RHFTextField name="phone" label="Téléphone" />
              <RHFTextField name="email" label="Email (optionnel)" />

              <RHFSelect name="role" label="Rôle">
                <MenuItem value="cashier">Caissier</MenuItem>
                <MenuItem value="supervisor">Superviseur</MenuItem>
              </RHFSelect>

              {!employeeId && (
                <RHFTextField
                  name="password"
                  label="Mot de passe"
                  type="password"
                  autoComplete="new-password"
                />
              )}

              <RHFTextField
                name="pin_code"
                label="Code PIN (4 chiffres)"
                inputProps={{ maxLength: 4, pattern: '[0-9]*' }}
              />

              {role === 'cashier' && (
                <RHFSelect name="store_id" label="Magasin assigné">
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
                <RHFSelect name="supervised_store_id" label="Magasin supervisé">
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

              <RHFSwitch name="is_active" label="Actif" />
            </Box>

            <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
              {employeeId && (
                <Button
                  color="error"
                  onClick={handleDelete}
                  startIcon={<Iconify icon="eva:trash-2-outline" />}
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
                {employeeId ? 'Enregistrer' : 'Créer'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>

        <Grid xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informations complémentaires
            </Typography>

            {(values.store_id || values.supervised_store_id) && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">
                  {role === 'cashier' ? 'Magasin assigné:' : 'Magasin supervisé:'}
                </Typography>
                <Typography>
                  {getSelectedStoreName(values.store_id || values.supervised_store_id || '')}
                </Typography>
              </Box>
            )}

            {/* Afficher les magasins actuels de l'employé en mode édition */}
            {employeeId && currentEmployee && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">
                  Magasin(s) actuel(s):
                </Typography>
                {getCurrentEmployeeStores().map((storeName, index) => (
                  <Typography key={index} variant="body2" color="text.secondary">
                    • {storeName}
                  </Typography>
                ))}
              </Box>
            )}

            {employeeId && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Statut: {values.is_active ? (
                    <Typography component="span" color="success.main">
                      Actif
                    </Typography>
                  ) : (
                    <Typography component="span" color="error">
                      Inactif
                    </Typography>
                  )}
                </Typography>
              </Box>
            )}

            {/* Informations supplémentaires sur l'employé */}
            {currentEmployee && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">
                  Nombre total de magasins assignés:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentEmployee.totalStoresAssigned}
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
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
import { Cashier, Supervisor, EmployeeFormValues, EmployeeRole } from 'src/types/employee';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFSelect, RHFSwitch } from 'src/components/hook-form';
// requests
import { employeeRequests } from 'src/utils/request';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentEmployee?: Cashier | Supervisor;
};

export default function EmployeeQuickEditForm({ currentEmployee, open, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const EmployeeSchema = Yup.object().shape({
    first_name: Yup.string().required('Le prénom est requis'),
    last_name: Yup.string().required('Le nom est requis'),
    phone: Yup.string()
      .required('Le téléphone est requis')
      .matches(/^[0-9]{8,15}$/, 'Numéro de téléphone invalide'),
    email: Yup.string().email('Email invalide').optional(),
    role: Yup.string().required('Le rôle est requis'),
    is_active: Yup.boolean(),
    store_id: Yup.string().when('role', {
      is: 'cashier',
      then: (schema) => schema.required('Le magasin est requis pour un caissier'),
      otherwise: (schema) => schema.notRequired(),
    }),
    supervised_store_id: Yup.string().when('role', {
      is: 'supervisor',
      then: (schema) => schema.required('Le magasin supervisé est requis'),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const defaultValues = useMemo<EmployeeFormValues>(
    () => ({
      first_name: currentEmployee?.first_name || '',
      last_name: currentEmployee?.last_name || '',
      phone: currentEmployee?.phone || '',
      email: currentEmployee?.email || '',
      role: currentEmployee?.role || 'cashier',
      is_active: currentEmployee?.is_active || false,
      store_id: currentEmployee?.role === 'cashier' ? (currentEmployee as Cashier).store_id || '' : '',
      supervised_store_id: currentEmployee?.role === 'supervisor' 
        ? (currentEmployee as Supervisor).supervised_store_id || '' 
        : '',
    }),
    [currentEmployee]
  );

  const methods = useForm<EmployeeFormValues>({
    resolver: yupResolver(EmployeeSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const role = watch('role');

  const onSubmit = useCallback(
    async (data: EmployeeFormValues) => {
      try {
        if (!currentEmployee?.id) {
          throw new Error('ID de l\'employé non défini');
        }
        
        await employeeRequests.updateEmployee(currentEmployee.id, {
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          email: data.email,
          role: data.role as EmployeeRole,
          is_active: data.is_active,
          ...(data.role === 'cashier' ? { store_id: data.store_id } : {}),
          ...(data.role === 'supervisor' ? { supervised_store_id: data.supervised_store_id } : {}),
        });
        
        reset();
        onClose();
        enqueueSnackbar('Employé mis à jour avec succès !');
      } catch (error) {
        console.error(error);
        enqueueSnackbar(
          error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
          { variant: 'error' }
        );
      }
    },
    [currentEmployee?.id, enqueueSnackbar, onClose, reset]
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
        <DialogTitle>Modification rapide de l'employé</DialogTitle>

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
            <RHFTextField name="first_name" label="Prénom" />

            <RHFTextField name="last_name" label="Nom" />

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
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="cashier">Caissier</MenuItem>
              <MenuItem value="supervisor">Superviseur</MenuItem>
            </RHFSelect>

            {role === 'cashier' && (
              <RHFTextField
                name="store_id"
                label="Magasin assigné"
              />
            )}

            {role === 'supervisor' && (
              <RHFTextField
                name="supervised_store_id"
                label="Magasin supervisé"
              />
            )}

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
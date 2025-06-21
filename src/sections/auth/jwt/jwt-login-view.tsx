 import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// redux
import { useDispatch } from 'src/redux/store';
import { loginOwner } from 'src/redux/slices/auth.slice'; 
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type FormValuesProps = {
  phone: string;
  password: string;
};

export default function JwtLoginView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [errorMsg, setErrorMsg] = useState('');
  const showPassword = useBoolean();

  const LoginSchema = Yup.object().shape({
    phone: Yup.string()
      .required('Le numéro de téléphone est requis'),
    password: Yup.string()
      .required('Le mot de passe est requis')
      .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  });

  const defaultValues = {
    phone: '',
    password: '',
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = useCallback(
  async (data: FormValuesProps) => {
    try {
      setErrorMsg('');
      await dispatch(loginOwner(data));
      
      enqueueSnackbar('Connexion réussie!', { 
        variant: 'success',
        autoHideDuration: 2000
      });
      
      navigate(paths.dashboard.root, { replace: true }); 
      
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      let errorMessage = 'Identifiants incorrects';
      if (error.response?.data?.code === "ROLE_NOT_ALLOWED") {
        errorMessage = "Accès réservé aux propriétaires et superviseurs";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorMsg(errorMessage);
      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        autoHideDuration: 3000
      });
    }
  },
  [dispatch, enqueueSnackbar, navigate]

);
  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4">Connexion</Typography>
      <Typography variant="body2">
        Entrez vos identifiants pour accéder à votre espace
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <RHFTextField
        name="phone"
        label="Numéro de téléphone"
        placeholder="Ex: 0701234567"
        InputProps={{
          startAdornment: <InputAdornment position="start">+509</InputAdornment>,
        }}
      />

      <RHFTextField
        name="password"
        label="Mot de passe"
        type={showPassword.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={showPassword.onToggle} edge="end">
                <Iconify icon={showPassword.value ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{ mt: 1 }}
      >
        {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
      </LoadingButton>

      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ my: 2 }}>
        
      </Stack>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {renderHead}
      {renderForm}
    </FormProvider>
  );
}
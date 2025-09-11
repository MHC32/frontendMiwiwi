// src/sections/meter-reading/meter-reading-verify-dialog.tsx (Version compatible)
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFRadioGroup } from 'src/components/hook-form';
import Image from 'src/components/image';
// types
import { IMeterReadingItem, MeterReadingStatus } from 'src/types/meter-reading';
// api
import { meterReadingRequests } from 'src/utils/request';

// ----------------------------------------------------------------------

type FormValuesProps = {
  status: MeterReadingStatus;
  notes: string;
};

type Props = {
  reading: IMeterReadingItem | null;
  open: boolean;
  onClose: VoidFunction;
  onSuccess: VoidFunction;
  onVerify?: (id: string, payload: { status: MeterReadingStatus; notes?: string }) => Promise<any>; // Prop optionnelle
};

export default function MeterReadingVerifyDialog({
  reading,
  open,
  onClose,
  onSuccess,
  onVerify, // Prop optionnelle pour Redux
}: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const VerifySchema = Yup.object().shape({
    status: Yup.string().required('Le statut est requis'),
    notes: Yup.string(),
  });

  const defaultValues = {
    status: 'verified' as MeterReadingStatus,
    notes: '',
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(VerifySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    if (!reading) return;

    try {
      const payload = {
        status: data.status,
        notes: data.notes || undefined,
      };

      // Utiliser la fonction Redux si disponible, sinon l'API directe
      if (onVerify) {
        await onVerify(reading.id, payload);
      } else {
        await meterReadingRequests.verifyReading(reading.id, payload);
      }

      enqueueSnackbar('Relevé vérifié avec succès !');
      reset();
      onClose();
      onSuccess();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Erreur lors de la vérification', { variant: 'error' });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!reading) return null;

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Vérifier le relevé</DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2">Informations du relevé</Typography>
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Valeur: <strong>{reading.reading_value}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: <strong>{reading.reading_type}</strong>
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Caissier: <strong>{reading.cashier.first_name} {reading.cashier.last_name}</strong>
              </Typography>
            </Stack>

            {reading.photo && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Photo du relevé</Typography>
                <Image
                  src={reading.photo}
                  alt="Relevé"
                  sx={{ width: '100%', maxWidth: 300, height: 200, borderRadius: 1 }}
                />
              </Stack>
            )}

            <RHFRadioGroup
              name="status"
              label="Statut"
              options={[
                { label: 'Vérifier (Approuver)', value: 'verified' },
                { label: 'Rejeter', value: 'rejected' },
              ]}
            />

            <RHFTextField
              name="notes"
              label="Notes (optionnel)"
              multiline
              rows={3}
              placeholder="Ajouter des commentaires..."
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Annuler
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Confirmer
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
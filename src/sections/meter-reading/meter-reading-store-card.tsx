// src/sections/meter-reading/meter-reading-store-card.tsx
import { memo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
// utils
import { fDateTime } from 'src/utils/format-time';
// components
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
// types
import { IStoreItem } from 'src/types/store';

// ----------------------------------------------------------------------

type Props = {
  store: IStoreItem;
  onViewReadings: VoidFunction;
};

function MeterReadingStoreCard({ store, onViewReadings }: Props) {
  const {
    name,
    contact,
    is_active,
    photo,
    created_at
  } = store;

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar
            alt={name}
            src={photo}
            sx={{ width: 48, height: 48 }}
          />
        }
        title={
          <Typography variant="subtitle1" noWrap>
            {name}
          </Typography>
        }
        subheader={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mingcute:location-fill" width={14} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {contact.address.city}
            </Typography>
          </Stack>
        }
        action={
          <Label variant="soft" color={is_active ? 'success' : 'error'}>
            {is_active ? 'Actif' : 'Inactif'}
          </Label>
        }
      />

      <Stack spacing={2} sx={{ p: 3, pt: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:phone-bold" width={16} />
          <Typography variant="body2" color="text.secondary">
            {contact.phone}
          </Typography>
        </Stack>

        {created_at && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:calendar-bold" width={16} />
            <Typography variant="body2" color="text.secondary">
              Créé le {fDateTime(created_at)}
            </Typography>
          </Stack>
        )}

        <Button
          fullWidth
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon="solar:eye-bold" />}
          onClick={onViewReadings}
          disabled={!is_active}
        >
          Voir les relevés
        </Button>
      </Stack>
    </Card>
  );
}

export default memo(MeterReadingStoreCard);
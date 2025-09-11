// src/sections/meter-reading/meter-reading-table-row.tsx
import { useState, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import { fDateTime } from 'src/utils/format-time';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Image from 'src/components/image';
// types
import { IMeterReadingItem } from 'src/types/meter-reading';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  row: IMeterReadingItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onVerifyReading: VoidFunction;
};

export default function MeterReadingTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onVerifyReading,
}: Props) {
  const { 
    reading_value, 
    reading_type, 
    photo, 
    status, 
    cashier, 
    verified_by, 
    created_at, 
    notes 
  } = row;

  const confirm = useBoolean();
  const collapse = useBoolean();
  const popover = usePopover();

  const renderStatus = (
    <Label
      variant="soft"
      color={
        (status === 'verified' && 'success') ||
        (status === 'rejected' && 'error') ||
        'warning'
      }
    >
      {status === 'pending' && 'En attente'}
      {status === 'verified' && 'Vérifié'}
      {status === 'rejected' && 'Rejeté'}
    </Label>
  );

  const renderType = (
    <Label
      variant="outlined"
      color={
        (reading_type === 'opening' && 'info') ||
        (reading_type === 'closing' && 'warning') ||
        'default'
      }
    >
      {reading_type === 'opening' && 'Ouverture'}
      {reading_type === 'closing' && 'Fermeture'}
      {reading_type === 'daily' && 'Quotidien'}
    </Label>
  );

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Typography variant="subtitle2" noWrap>
            {reading_value}
          </Typography>
        </TableCell>

        <TableCell>{renderType}</TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              alt={`${cashier.first_name} ${cashier.last_name}`}
              sx={{ width: 32, height: 32 }}
            >
              {cashier.first_name[0]}{cashier.last_name[0]}
            </Avatar>
            <ListItemText
              primary={`${cashier.first_name} ${cashier.last_name}`}
              secondary={cashier._id}
              primaryTypographyProps={{ typography: 'body2' }}
              secondaryTypographyProps={{
                component: 'span',
                color: 'text.disabled',
              }}
            />
          </Stack>
        </TableCell>

        <TableCell>
          <Typography variant="body2" noWrap>
            {fDateTime(created_at)}
          </Typography>
        </TableCell>

        <TableCell>{renderStatus}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton
            color={collapse.value ? 'inherit' : 'default'}
            onClick={collapse.onToggle}
            sx={{
              ...(collapse.value && {
                bgcolor: 'action.hover',
              }),
            }}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell sx={{ p: 0, border: 'none' }} colSpan={8}>
          <Collapse
            in={collapse.value}
            timeout="auto"
            unmountOnExit
            sx={{ bgcolor: 'background.neutral' }}
          >
            <Paper sx={{ m: 1.5 }}>
              <Stack
                direction="row"
                alignItems="center"
                sx={{
                  p: (theme) => theme.spacing(1.5, 2, 1.5, 1.5),
                  '&:not(:last-of-type)': {
                    borderBottom: (theme) => `solid 2px ${theme.palette.background.neutral}`,
                  },
                }}
              >
                <Stack direction="row" spacing={2} flexGrow={1}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Photo du relevé</Typography>
                    {photo && (
                      <Image
                        src={photo}
                        alt="Relevé"
                        sx={{ width: 120, height: 80, borderRadius: 1 }}
                      />
                    )}
                  </Stack>

                  {notes && (
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">Notes</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {notes}
                      </Typography>
                    </Stack>
                  )}

                  {verified_by && (
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">Vérifié par</Typography>
                      <Typography variant="body2">
                        {verified_by.first_name} {verified_by.last_name}
                      </Typography>
                    </Stack>
                  )}
                </Stack>

                {status === 'pending' && (
                  <Button
                    size="small"
                    color="primary"
                    variant="outlined"
                    startIcon={<Iconify icon="eva:checkmark-circle-2-outline" />}
                    onClick={onVerifyReading}
                  >
                    Vérifier
                  </Button>
                )}
              </Stack>
            </Paper>
          </Collapse>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Supprimer
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Supprimer"
        content="Êtes-vous sûr de vouloir supprimer ce relevé ?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Supprimer
          </Button>
        }
      />
    </>
  );
}

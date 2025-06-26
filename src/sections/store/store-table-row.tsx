import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// types
import { IStoreItem } from 'src/types/store';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import StoreQuickEditForm from './store-quick-edit-form';

// ----------------------------------------------------------------------

type Props = {
  row: IStoreItem;
  selected: boolean;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onEditRow: VoidFunction;
  onToggleStatus: VoidFunction;
};

export default function StoreTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onToggleStatus,
}: Props) {
  const { name, contact, is_active, employees,} = row;

  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={name} sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <Iconify icon="solar:shop-bold" />
          </Avatar>

          <ListItemText
            primary={name}
            secondary={`${contact.address.city}, ${contact.address.country}`}
            primaryTypographyProps={{ typography: 'body2', fontWeight: 'bold' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {contact.phone}
        </TableCell>

        <TableCell>
          <Label variant="soft" color={is_active ? 'success' : 'error'}>
            {is_active ? 'Actif' : 'Inactif'}
          </Label>
        </TableCell>

        <TableCell>
          {employees?.length || 0} employé(s)
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Modification rapide" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <StoreQuickEditForm currentStore={row} open={quickEdit.value} onClose={quickEdit.onFalse} />

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

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Modifier
        </MenuItem>

        <MenuItem
          onClick={() => {
            onToggleStatus();
            popover.onClose();
          }}
        >
          <Iconify icon={is_active ? "solar:eye-closed-bold" : "solar:eye-bold"} />
          {is_active ? 'Désactiver' : 'Activer'}
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Supprimer le magasin"
        content="Êtes-vous sûr de vouloir supprimer ce magasin ? Cette action est irréversible."
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Confirmer
          </Button>
        }
      />
    </>
  );
}
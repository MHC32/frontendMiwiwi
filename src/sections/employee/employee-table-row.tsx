import { useEffect } from 'react';
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
import { Employee, isCashier, isSupervisor, getEmployeeStoreNames } from 'src/types/employee';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import EmployeeQuickEditForm from './employee-quick-edit-form';

// ----------------------------------------------------------------------

type Props = {
  row: Employee;
  selected: boolean;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onEditRow: VoidFunction;
  onToggleStatus: VoidFunction;
};

export default function EmployeeTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onToggleStatus,
}: Props) {
  const { _id, first_name, last_name, phone, email, is_active, role } = row;

  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();

  const fullName = `${first_name} ${last_name}`;
  const roleLabel = role === 'cashier' ? 'Caissier' : 'Superviseur';
  
  // Gestion des informations de magasin selon les nouveaux types
  const getStoreInfo = () => {
    if (isCashier(row)) {
      const storeNames = getEmployeeStoreNames(row);
      if (storeNames.length === 0) {
        return 'Aucun magasin assigné';
      }
      if (storeNames.length === 1) {
        return `Magasin: ${storeNames[0]}`;
      }
      return `Magasins: ${storeNames.join(', ')}`;
    } else if (isSupervisor(row)) {
      return row.supervisedStore 
        ? `Supervise: ${row.supervisedStore.name}` 
        : 'Aucun magasin supervisé';
    }
    return 'Information non disponible';
  };

  const storeInfo = getStoreInfo();

  console.log('employee row data:', row);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            alt={fullName} 
            sx={{ 
              mr: 2,
              bgcolor: is_active ? 'primary.main' : 'error.light'
            }}
          >
            {first_name.charAt(0)}{last_name.charAt(0)}
          </Avatar>

          <ListItemText
            primary={fullName}
            secondary={email || 'Aucun email'}
            primaryTypographyProps={{ typography: 'body2', fontWeight: 'bold' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {phone}
        </TableCell>

        <TableCell>
          <Label variant="soft" color={role === 'cashier' ? 'info' : 'warning'}>
            {roleLabel}
          </Label>
        </TableCell>

        <TableCell>
          <Label variant="soft" color={is_active ? 'success' : 'error'}>
            {is_active ? 'Actif' : 'Inactif'}
          </Label>
        </TableCell>

        <TableCell>
          <Tooltip title={storeInfo} placement="top" arrow>
            <span style={{ 
              display: 'block',
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {storeInfo}
            </span>
          </Tooltip>
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

      <EmployeeQuickEditForm currentEmployee={row} open={quickEdit.value} onClose={quickEdit.onFalse} />

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
        title="Supprimer l'employé"
        content="Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible."
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Confirmer
          </Button>
        }
      />
    </>
  );
}
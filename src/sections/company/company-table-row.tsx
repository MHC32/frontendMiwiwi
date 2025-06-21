// @mui
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
import { ICompanyItem } from 'src/types/company';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: ICompanyItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  hideActions?: boolean; 
};

export default function CompanyTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  hideActions = false,
}: Props) {
  const { name, refCode, settings, status, metadata } = row;
  // const { isActive } = status;

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
          <Avatar alt={name} sx={{ mr: 2 }}>
            {name.charAt(0)}
          </Avatar>

          <ListItemText
            primary={name}
            secondary={`Ref: ${refCode}`}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {settings.currency} - Taxe: {settings.taxRate}%
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {metadata.storeCount} magasins
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {metadata.employeeCount} employés
        </TableCell>

        {/* <TableCell>
          <Label
            variant="soft"
            color={isActive ? 'success' : 'error'}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Label>
        </TableCell> */}

        {!hideActions && (
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Édition rapide" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      )}

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Édition rapide" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
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

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Éditer
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Supprimer"
        content="Êtes-vous sûr de vouloir supprimer cette entreprise ?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Supprimer
          </Button>
        }
      />
    </>
  );
}
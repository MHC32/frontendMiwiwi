import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// types
import { IProductItem } from 'src/types/product';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

type Props = {
  row: IProductItem;
  selected: boolean;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onEditRow: VoidFunction;
  onToggleStatus: VoidFunction;
};

export default function ProductTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onToggleStatus,
}: Props) {
  const { _id, name, barcode, type, store_id, category_id, is_active, main_image, inventory, pricing } = row;

  const confirm = useBoolean();
  const popover = usePopover();

  const getTypeLabel = (productType: string) => {
    switch (productType) {
      case 'weight': return 'Poids';
      case 'fuel': return 'Carburant';
      case 'unit': return 'Unité';
      default: return productType;
    }
  };

  const getTypeColor = (productType: string) => {
    switch (productType) {
      case 'weight': return 'info';
      case 'fuel': return 'warning';
      case 'unit': return 'success';
      default: return 'default';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'HTG'
    }).format(price);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            alt={name} 
            src={main_image || undefined}
            sx={{ 
              mr: 2,
              bgcolor: is_active ? 'primary.main' : 'grey.500'
            }}
          >
            <Iconify icon="solar:box-bold" />
          </Avatar>
          
          <div>
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
            {barcode && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                {barcode}
              </Typography>
            )}
          </div>
        </TableCell>

        <TableCell>
          <Chip 
            label={getTypeLabel(type)}
            color={getTypeColor(type) as any}
            size="small"
            variant="soft"
          />
        </TableCell>

        <TableCell>
          <Typography variant="body2">
            {store_id?.name || 'Non assigné'}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">
            {category_id?.name || 'Aucune'}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Typography variant="body2">
            {inventory.current} {row.unit}
          </Typography>
          {inventory.current <= inventory.min_stock && (
            <Label color="error" variant="soft">
              Stock faible
            </Label>
          )}
        </TableCell>

        <TableCell align="right">
          <Typography variant="body2" fontWeight="medium">
            {formatPrice(pricing.base_price)}
          </Typography>
          {pricing.mode === 'fuel' && pricing.fuel_config && (
            <Typography variant="caption" color="text.secondary">
              /{pricing.fuel_config.display_unit}
            </Typography>
          )}
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={is_active ? 'success' : 'error'}
          >
            {is_active ? 'Actif' : 'Inactif'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
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
        title="Supprimer le produit"
        content="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Confirmer
          </Button>
        }
      />
    </>
  );
}
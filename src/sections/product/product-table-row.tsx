// src/sections/product/product-table-row.tsx - Mise à jour avec édition rapide
import { useState } from 'react';
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
//
import ProductQuickEditForm from './product-quick-edit-form';

// ----------------------------------------------------------------------

type Props = {
  row: IProductItem;
  selected: boolean;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onEditRow: VoidFunction;
  onToggleStatus: (currentStatus: boolean) => void;
  onRefresh?: VoidFunction;
};

export default function ProductTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onToggleStatus,
  onRefresh,
}: Props) {
  const { _id, name, barcode, type, store_id, category_id, is_active, main_image, inventory, pricing } = row;

  const confirm = useBoolean();
  const popover = usePopover();
  const quickEdit = useBoolean();

  const getTypeLabel = (productType: string) => {
    switch (productType) {
      case 'weight': return 'Poids';
      case 'volume': return 'Volume';
      case 'quantity': return 'Quantité';
      case 'fuel': return 'Carburant';
      default: return productType;
    }
  };

  const getTypeColor = (productType: string) => {
    switch (productType) {
      case 'weight': return 'info';
      case 'volume': return 'info';
      case 'quantity': return 'success';
      case 'fuel': return 'warning';
      default: return 'default';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'HTG'
    }).format(price);
  };

  // Pour les produits fuel, pas d'inventory
  const hasInventory = type !== 'fuel';
  const isLowStock = hasInventory && inventory && inventory.current <= (inventory.min_stock || 0);

  return (
    <>
      <TableRow hover selected={selected}>
       

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            alt={name} 
            src={main_image || undefined}
            sx={{ 
              mr: 2,
              bgcolor: is_active ? 'primary.main' : 'grey.500'
            }}
          >
            {name.charAt(0).toUpperCase()}
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
          <Label 
            variant="soft" 
            color={getTypeColor(type) as any}
          >
            {getTypeLabel(type)}
          </Label>
        </TableCell>

        <TableCell>
          <Typography variant="body2">
            {store_id.name}
          </Typography>
        </TableCell>

        <TableCell>
          {category_id ? (
            <Chip 
              label={category_id.name} 
              variant="outlined" 
              size="small"
              sx={{ maxWidth: 120 }}
            />
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              -
            </Typography>
          )}
        </TableCell>

        <TableCell align="right">
          {hasInventory ? (
            <>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: isLowStock ? 'error.main' : 'text.primary',
                  fontWeight: isLowStock ? 'bold' : 'normal'
                }}
              >
                {inventory?.current ?? 0}
              </Typography>
              {isLowStock && (
                <Tooltip title="Stock faible">
                  <Iconify 
                    icon="eva:alert-triangle-fill" 
                    sx={{ color: 'warning.main', ml: 0.5 }}
                    width={16}
                  />
                </Tooltip>
              )}
            </>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              N/A
            </Typography>
          )}
        </TableCell>

        <TableCell align="right">
          <Typography variant="body2">
            {formatPrice(pricing?.base_price ?? 0)}
          </Typography>
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
          <Tooltip title="Modification rapide" placement="top" arrow>
            <IconButton
              color={quickEdit.value ? 'inherit' : 'default'}
              onClick={quickEdit.onTrue}
            >
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
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Modifier
        </MenuItem>

        <MenuItem
          onClick={() => {
            quickEdit.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:settings-bold" />
          Édition rapide
        </MenuItem>

        <MenuItem
          onClick={() => {
            onToggleStatus(is_active);
            popover.onClose();
          }}
        >
          <Iconify icon={is_active ? "eva:eye-off-fill" : "eva:eye-fill"} />
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
        content="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action ne peut pas être annulée."
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
              confirm.onFalse();
            }}
          >
            Supprimer
          </Button>
        }
      />

      <ProductQuickEditForm
        currentProduct={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        onSuccess={() => {
          onRefresh?.();
          quickEdit.onFalse();
        }}
      />
    </>
  );
}
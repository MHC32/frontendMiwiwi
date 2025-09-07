// src/sections/category/category-table-row.tsx
import { useState, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
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
// types
import { ICategory } from 'src/types/category';
import { IStoreItem } from 'src/types/store';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: ICategory;
  categories: ICategory[];
  stores: IStoreItem[];
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onToggleStatus: VoidFunction;
};

export default function CategoryTableRow({
  row,
  categories,
  stores,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onToggleStatus,
}: Props) {
  const { _id, name, parent_id, color, icon, stores: categoryStores, is_active } = row;

  const confirm = useBoolean();
  const collapse = useBoolean();
  const popover = usePopover();

  // Trouver la catégorie parent
  const parentCategory = parent_id ? categories.find(cat => cat._id === parent_id) : null;

  // Trouver les détails des stores
  const storeDetails = stores.filter(store => categoryStores.includes(store.id));

  // Trouver les sous-catégories
  const childCategories = categories.filter(cat => cat.parent_id === _id);

  // Construire le chemin complet de la catégorie
  const getCategoryPath = useCallback((category: ICategory): string => {
    if (!category.parent_id) return category.name;
    const parent = categories.find(cat => cat._id === category.parent_id);
    if (!parent) return category.name;
    return `${getCategoryPath(parent)} > ${category.name}`;
  }, [categories]);

  const fullPath = getCategoryPath(row);

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      <TableCell>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            variant="rounded"
            sx={{
              width: 32,
              height: 32,
              bgcolor: color,
              color: 'white',
            }}
          >
            <Iconify 
              icon={getCategoryIcon(icon)} 
              width={16}
            />
          </Avatar>

          <Stack spacing={0.5}>
            <ListItemText
              primary={name}
              secondary={parentCategory ? `Sous-catégorie de: ${parentCategory.name}` : 'Catégorie racine'}
              primaryTypographyProps={{ typography: 'body2' }}
              secondaryTypographyProps={{
                component: 'span',
                color: 'text.disabled',
                typography: 'caption',
              }}
            />
            
            {childCategories.length > 0 && (
              <Box>
                <Button
                  size="small"
                  color="inherit"
                  startIcon={
                    <Iconify
                      icon={collapse.value ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                    />
                  }
                  onClick={collapse.onToggle}
                  sx={{ typography: 'caption', color: 'text.disabled' }}
                >
                  {childCategories.length} sous-catégorie(s)
                </Button>
              </Box>
            )}
          </Stack>
        </Stack>
      </TableCell>

      <TableCell>
        {parentCategory ? (
          <Chip
            size="small"
            label={parentCategory.name}
            variant="soft"
            color="default"
          />
        ) : (
          <Typography variant="caption" color="text.disabled">
            Racine
          </Typography>
        )}
      </TableCell>

      <TableCell align="center">
        <Stack direction="row" spacing={0.5} justifyContent="center">
          {storeDetails.length > 0 ? (
            storeDetails.slice(0, 2).map((store) => (
              <Chip
                key={store.id}
                size="small"
                label={store.name}
                variant="soft"
                color="info"
              />
            ))
          ) : (
            <Typography variant="caption" color="text.disabled">
              Aucun
            </Typography>
          )}
          {storeDetails.length > 2 && (
            <Chip
              size="small"
              label={`+${storeDetails.length - 2}`}
              variant="soft"
              color="default"
            />
          )}
        </Stack>
      </TableCell>

      <TableCell align="center">
        <Box
          sx={{
            width: 20,
            height: 20,
            bgcolor: color,
            borderRadius: '50%',
            border: (theme) => `solid 1px ${theme.palette.divider}`,
          }}
        />
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={(is_active && 'success') || 'error'}
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
  );

  const renderSecondary = (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={8}>
        <Collapse
          in={collapse.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
        >
          <Stack component={Paper} sx={{ m: 1.5 }}>
            {childCategories.map((child) => (
              <Stack
                key={child._id}
                direction="row"
                alignItems="center"
                sx={{
                  p: (theme) => theme.spacing(1.5, 2, 1.5, 3),
                  '&:not(:last-of-type)': {
                    borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
                  },
                }}
              >
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: child.color,
                    color: 'white',
                    mr: 2,
                  }}
                >
                  <Iconify 
                    icon={getCategoryIcon(child.icon)} 
                    width={12}
                  />
                </Avatar>

                <ListItemText
                  primary={child.name}
                  secondary={`${child.stores.length} magasin(s)`}
                  primaryTypographyProps={{ typography: 'body2' }}
                  secondaryTypographyProps={{ typography: 'caption', color: 'text.disabled' }}
                />

                <Label
                  variant="soft"
                  color={(child.is_active && 'success') || 'error'}
                  sx={{ mr: 1 }}
                >
                  {child.is_active ? 'Actif' : 'Inactif'}
                </Label>
              </Stack>
            ))}
          </Stack>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

      {renderSecondary}

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
          <Iconify icon={is_active ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
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
        title="Supprimer la catégorie"
        content={
          <Box>
            <Typography gutterBottom>
              Êtes-vous sûr de vouloir supprimer la catégorie <strong>{name}</strong> ?
            </Typography>
            {childCategories.length > 0 && (
              <Typography variant="body2" color="error.main">
                Attention: Cette catégorie a {childCategories.length} sous-catégorie(s) qui seront également affectées.
              </Typography>
            )}
          </Box>
        }
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Supprimer
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

// Helper pour obtenir l'icône de catégorie
function getCategoryIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    food: 'mdi:food',
    clothing: 'mdi:tshirt-crew',
    electronics: 'mdi:cellphone',
    books: 'mdi:book-open-page-variant',
    sports: 'mdi:soccer',
    home: 'mdi:home',
    beauty: 'mdi:face-woman',
    health: 'mdi:heart-pulse',
    automotive: 'mdi:car',
    other: 'mdi:dots-horizontal',
  };

  return iconMap[icon] || iconMap.other;
}
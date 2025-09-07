// src/sections/product/view/product-details-view.tsx
import { useEffect, useState } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
// routes
import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// types
import { IProductItem } from 'src/types/product';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
// requests
import { productRequests } from 'src/utils/request';
//
import ProductQuickEditForm from './product-quick-edit-form';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'general', label: 'Général', icon: 'solar:clipboard-text-bold' },
  { value: 'inventory', label: 'Inventaire', icon: 'solar:box-bold' },
  { value: 'pricing', label: 'Tarification', icon: 'solar:dollar-bold' },
  { value: 'images', label: 'Images', icon: 'solar:gallery-bold' },
];

// ----------------------------------------------------------------------

export default function ProductDetailsView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const { id } = params;

  const [currentProduct, setCurrentProduct] = useState<IProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('general');
  
  const quickEdit = useBoolean();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await productRequests.getProductById(id);
        setCurrentProduct(response);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        enqueueSnackbar('Erreur lors du chargement du produit', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, enqueueSnackbar]);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'weight': return 'Poids';
      case 'fuel': return 'Carburant';
      case 'unit': return 'Unité';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
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

  const isLowStock = currentProduct 
    ? currentProduct.inventory.current <= currentProduct.inventory.min_stock 
    : false;

  if (loading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Typography>Chargement du produit...</Typography>
        </Box>
      </Container>
    );
  }

  if (!currentProduct) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Typography>Produit non trouvé</Typography>
        </Box>
      </Container>
    );
  }

  const renderGeneral = (
    <Grid container spacing={3}>
      <Grid xs={12} md={8}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Informations générales
          </Typography>

          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
                Nom:
              </Typography>
              <Typography variant="body2">{currentProduct.name}</Typography>
            </Stack>

            {currentProduct.barcode && (
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
                  Code-barres:
                </Typography>
                <Typography variant="body2">{currentProduct.barcode}</Typography>
              </Stack>
            )}

            <Stack direction="row" spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
                Type:
              </Typography>
              <Label variant="soft" color={getTypeColor(currentProduct.type) as any}>
                {getTypeLabel(currentProduct.type)}
              </Label>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
                Unité:
              </Typography>
              <Typography variant="body2">{currentProduct.unit}</Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
                Magasin:
              </Typography>
              <Typography variant="body2">{currentProduct.store_id.name}</Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
                Catégorie:
              </Typography>
              {currentProduct.category_id ? (
                <Chip 
                  label={currentProduct.category_id.name} 
                  variant="outlined" 
                  size="small"
                />
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Aucune catégorie
                </Typography>
              )}
            </Stack>

            <Stack direction="row" spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
                Statut:
              </Typography>
              <Label variant="soft" color={currentProduct.is_active ? 'success' : 'error'}>
                {currentProduct.is_active ? 'Actif' : 'Inactif'}
              </Label>
            </Stack>
          </Stack>
        </Card>
      </Grid>

      <Grid xs={12} md={4}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Image principale
          </Typography>
          <Box sx={{ textAlign: 'center' }}>
            <Avatar
              src={currentProduct.main_image || undefined}
              sx={{
                width: 160,
                height: 160,
                mx: 'auto',
                mb: 2,
                fontSize: '3rem',
              }}
            >
              {currentProduct.name.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );

  const renderInventory = (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Gestion d'inventaire
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              bgcolor: isLowStock ? 'error.lighter' : 'primary.lighter',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" sx={{ color: isLowStock ? 'error.main' : 'primary.main' }}>
              {currentProduct.inventory.current}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Stock actuel ({currentProduct.unit})
            </Typography>
            {isLowStock && (
              <Chip 
                label="Stock faible" 
                color="error" 
                variant="filled" 
                size="small" 
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Grid>

        <Grid xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              bgcolor: 'warning.lighter',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" sx={{ color: 'warning.main' }}>
              {currentProduct.inventory.min_stock}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Stock minimum ({currentProduct.unit})
            </Typography>
          </Box>
        </Grid>

        <Grid xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              bgcolor: 'info.lighter',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" sx={{ color: 'info.main' }}>
              {currentProduct.inventory.alert_enabled ? 'OUI' : 'NON'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Alertes activées
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );

  const renderPricing = (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Tarification
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              bgcolor: 'success.lighter',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" sx={{ color: 'success.main' }}>
              {formatPrice(currentProduct.pricing.base_price)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Prix de vente
            </Typography>
          </Box>
        </Grid>

        {currentProduct.pricing.buy_price && (
          <Grid xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                bgcolor: 'warning.lighter',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="h3" sx={{ color: 'warning.main' }}>
                {formatPrice(currentProduct.pricing.buy_price)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Prix d'achat
              </Typography>
            </Box>
          </Grid>
        )}

        <Grid xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              bgcolor: 'info.lighter',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" sx={{ color: 'info.main' }}>
              {currentProduct.pricing.mode.toUpperCase()}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Mode de tarification
            </Typography>
          </Box>
        </Grid>

        {currentProduct.pricing.mode === 'fuel' && currentProduct.pricing.fuel_config && (
          <Grid xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Configuration carburant
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
                  Prix par unité:
                </Typography>
                <Typography variant="body2">
                  {formatPrice(currentProduct.pricing.fuel_config.price_per_unit)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" sx={{ color: 'text.secondary', width: 120 }}>
                  Unité d'affichage:
                </Typography>
                <Typography variant="body2">
                  {currentProduct.pricing.fuel_config.display_unit}
                </Typography>
              </Stack>
            </Stack>
          </Grid>
        )}
      </Grid>
    </Card>
  );

  const renderImages = (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Images du produit
      </Typography>

      {currentProduct.images && currentProduct.images.length > 0 ? (
        <Grid container spacing={2}>
          {currentProduct.images.map((image, index) => (
            <Grid key={image._id} xs={12} sm={6} md={4} lg={3}>
              <Box
                sx={{
                  position: 'relative',
                  aspectRatio: '1/1',
                  borderRadius: 1,
                  overflow: 'hidden',
                  bgcolor: 'grey.100',
                }}
              >
                <img
                  src={image.url}
                  alt={`${currentProduct.name} ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {image.is_main && (
                  <Chip
                    label="Principal"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                    }}
                  />
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: 'grey.50',
            borderRadius: 1,
          }}
        >
          <Iconify icon="solar:gallery-bold" width={48} sx={{ color: 'grey.400', mb: 2 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Aucune image disponible
          </Typography>
        </Box>
      )}
    </Card>
  );

  const renderTabs = () => {
    switch (currentTab) {
      case 'general':
        return renderGeneral;
      case 'inventory':
        return renderInventory;
      case 'pricing':
        return renderPricing;
      case 'images':
        return renderImages;
      default:
        return renderGeneral;
    }
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={currentProduct.name}
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Produits', href: paths.dashboard.product.root },
            { name: currentProduct.name },
          ]}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={quickEdit.onTrue}
                startIcon={<Iconify icon="solar:pen-bold" />}
              >
                Édition rapide
              </Button>
              
              <Button
                component={RouterLink}
                href={paths.dashboard.product.edit(currentProduct._id)}
                variant="contained"
                startIcon={<Iconify icon="solar:pen-bold" />}
              >
                Modifier
              </Button>
            </Stack>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Tabs
            value={currentTab}
            onChange={handleChangeTab}
            sx={{
              px: 3,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={<Iconify icon={tab.icon} width={20} />}
                iconPosition="start"
              />
            ))}
          </Tabs>

          <Box sx={{ p: 3 }}>
            {renderTabs()}
          </Box>
        </Card>
      </Container>

      <ProductQuickEditForm
        currentProduct={currentProduct}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        onSuccess={() => {
          // Rafraîchir les données du produit
          if (id) {
            productRequests.getProductById(id).then(setCurrentProduct);
          }
          quickEdit.onFalse();
        }}
      />
    </>
  );
}
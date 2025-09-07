// src/sections/product/view/product-edit-view.tsx
import { useEffect, useState } from 'react';
// @mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// types
import { IProductItem } from 'src/types/product';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSnackbar } from 'src/components/snackbar';
// requests
import { productRequests } from 'src/utils/request';
//
import ProductNewEditForm from '../product-new-edit-form';

// ----------------------------------------------------------------------

export default function ProductEditView() {
  const settings = useSettingsContext();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const { id } = params;

  const [currentProduct, setCurrentProduct] = useState<IProductItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // Fetch le produit spécifique par ID
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

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Modifier le produit"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Produits',
            href: paths.dashboard.product.root,
          },
          { name: currentProduct.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProductNewEditForm 
        currentProduct={currentProduct} 
        productId={id} 
      />
    </Container>
  );
}